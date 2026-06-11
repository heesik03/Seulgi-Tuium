package com.heesik.backend.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import org.springframework.cache.annotation.Cacheable;
import com.heesik.backend.global.config.CacheConfig;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.converter.AnalysisConverter;
import com.heesik.backend.domain.analysis.dto.request.AnalysisTranslateReqDTO;
import com.heesik.backend.domain.analysis.dto.request.UrimalsaemReqDTO;
import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.error.UrimalsaemErrorCode;
import com.heesik.backend.domain.analysis.error.UrimalsaemException;
import com.heesik.backend.global.client.GeminiClient;
import com.heesik.backend.global.client.UrimalsaemClient;
import com.heesik.backend.global.error.code.GeminiErrorCode;
import com.heesik.backend.global.error.exception.GeminiException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import com.heesik.backend.global.util.GeminiRequestBuilder;
import com.heesik.backend.global.util.GeminiResponseParser;
import com.heesik.backend.global.util.PromptProvider;
import kr.co.shineware.nlp.komoran.core.Komoran;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final GeminiClient geminiClient;
    private final UrimalsaemClient urimalsaemClient;
    private final ObjectMapper objectMapper;
    private final PromptProvider promptProvider;
    private final Komoran komoran;


    private static final String SYSTEM_INSTRUCTION =
            "당신은 어려운 공공 문서, 법률 용어, 전문 의학 지식 등의 텍스트를 일반인도 " +
                    "쉽게 이해할 수 있는 친절한 구어체 문장으로 다듬어주는 국어 전문가입니다.";

    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of(
                    "convertedText", Map.of(
                            "type", "STRING",
                            "description", "이해하기 쉽게 변환된 전체 현대어 문장"
                    ),
                    "aiDifficultWords", Map.of(
                            "type", "ARRAY",
                            "items", Map.of("type", "STRING"),
                            "description", "원문에서 일반인이 이해하기 어려운 단어 리스트 (최대 5개)"
                    )
            ),
            "required", List.of("convertedText", "aiDifficultWords")
    );

    private String userPromptTemplate;

    // 프롬프트 파일 읽음
    @PostConstruct
    private void loadPrompts() {
        userPromptTemplate = promptProvider.loadPrompt("prompts/translate_user.txt");
        log.info("[AnalysisService] Gemini 프롬프트 파일 로드 완료");
    }

    // 우리말샘 OpenAPI를 호출하여 단어를 검색하고, 결과를 변환하여 반환함.
    @Cacheable(
            value = CacheConfig.URIMALSAEM_CACHE,
            key = "#request.q() + '_' + #request.start() + '_' + #request.num()",
            sync = true
    )
    public UrimalsaemResDTO searchUrimalsaem(UrimalsaemReqDTO request) {
        try {
            String rawJsonResponse = urimalsaemClient.search( // 우리말샘 API 호출
                    request.q(),
                    request.start(),
                    request.num()
            );

            JsonNode rootNode = objectMapper.readTree(rawJsonResponse); // String 응답을 JsonNode 객체로 역직렬화
            UrimalsaemResDTO responseDTO = AnalysisConverter.toUrimalsaemResDTO(rootNode);

            log.info("[AnalysisService] 단어 검색 완료 - Total Results Found: {}", responseDTO.total());
            return responseDTO;

        } catch (UrimalsaemException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AnalysisService] 단어 검색 중 처리되지 않은 예외 발생", e);
            throw new UrimalsaemException(UrimalsaemErrorCode.JSON_PARSING_ERROR);
        }
    }

    // Gemini API를 호출하여 어려운 말을 쉬운 말로 변환하고, 어려운 단어를 선정함.
    public AnalysisTranslateResDTO translateAndSearch(AnalysisTranslateReqDTO request) {
        log.info("[AnalysisService] 쉬운 말 번역 및 단어 뜻 검색 시작 - Text Length: {}", request.text().length());

        try {
            // Gemini Structured Output 요청 정의
            String userPrompt = promptProvider.buildPrompt(
                    userPromptTemplate,
                    Map.of(
                            "text", request.text(),
                            "tone", request.tone().getInstruction()
                    )
            );
            Map<String, Object> geminiRequestBody = GeminiRequestBuilder.buildStructuredOutputBody(
                    SYSTEM_INSTRUCTION, userPrompt, RESPONSE_SCHEMA
            );

            String geminiRawResponse = geminiClient.sendRequest(geminiRequestBody);

            // Gemini 공통 응답 파서 유틸리티를 활용한 Structured Output 추출
            JsonNode structuredResult = GeminiResponseParser.extractStructuredOutput(geminiRawResponse, objectMapper);

            String convertedText = structuredResult.path("convertedText").asText();

            // JSON 응답에서 aiDifficultWords 리스트 추출
            List<String> aiDifficultWords = new ArrayList<>();
            JsonNode wordsNode = structuredResult.path("aiDifficultWords");
            if (wordsNode.isArray()) {
                for (JsonNode wordNode : wordsNode) {
                    aiDifficultWords.add(wordNode.asText());
                }
            }

            // KOMORAN 형태소 분석기를 호출해 원문의 명사 리스트를 추출
            List<String> nouns = komoran.analyze(request.text()).getNouns();

            // 1글자 명사를 걸러내고 중복 제거한다.
            List<String> komoranKeywords = nouns.stream()
                    .distinct()
                    .filter(word -> word.length() > 1)
                    .toList();

            AnalysisTranslateResDTO response = AnalysisConverter.toAnalysisTranslateResDTO(convertedText, aiDifficultWords, komoranKeywords);

            log.info("[AnalysisService] 쉬운 말 번역 및 단어 추출 완료. AI 단어 수: {}, KOMORAN 단어 수: {}", 
                     response.aiDifficultWords().size(), response.komoranKeywords().size());

            return response;
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AnalysisService] 쉬운 말 번역 처리 중 오류 발생", e);
            throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
        }
    }

}
