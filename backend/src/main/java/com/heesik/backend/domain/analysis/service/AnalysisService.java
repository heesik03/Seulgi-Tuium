package com.heesik.backend.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.converter.AnalysisConverter;
import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
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
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.Executor;

@Slf4j
@Service
@RequiredArgsConstructor
public class AnalysisService {

    private final GeminiClient geminiClient;
    private final UrimalsaemClient urimalsaemClient;
    private final ObjectMapper objectMapper;
    private final Executor urimalsaemTaskExecutor;
    private final PromptProvider promptProvider;


    private static final String SYSTEM_INSTRUCTION =
            "당신은 어려운 공공 문서, 법률 용어, 전문 의학 지식 등의 텍스트를 초등학생도 쉽게 이해할 수 있는 친절한 구어체 문장으로 다듬어주는 국어 전문가입니다.";

    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "OBJECT",
            "properties", Map.of(
                    "convertedText", Map.of(
                            "type", "STRING",
                            "description", "이해하기 쉽게 변환된 전체 현대어 문장"
                    ),
                    "difficultWords", Map.of(
                            "type", "ARRAY",
                            "items", Map.of("type", "STRING"),
                            "description", "텍스트 내부에서 추출한 어려운 핵심 단어 리스트 (최대 5개)"
                    )
            ),
            "required", List.of("convertedText", "difficultWords")
    );

    private static final int MAX_WORD_SEARCH_COUNT = 5; // 어려운 말 번역기 최대 검색 단어 개수

    private String userPromptTemplate;

    // 프롬프트 파일 읽음
    @PostConstruct
    private void loadPrompts() {
        userPromptTemplate = promptProvider.loadPrompt("prompts/translate_user.txt");
        log.info("[AnalysisService] Gemini 프롬프트 파일 로드 완료");
    }

    // 우리말샘 OpenAPI를 호출하여 단어를 검색하고, 결과를 변환하여 반환함.
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


    // Gemini API를 호출하여 어려운 말을 쉬운 말로 변환하고 동시에 추출된 어려운 단어들의 뜻풀이를 우리말샘 API를 통해 병렬로 조회함.
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
            List<String> difficultWords = new ArrayList<>();
            JsonNode wordsNode = structuredResult.path("difficultWords");
            if (wordsNode.isArray()) {
                for (JsonNode word : wordsNode) {
                    difficultWords.add(word.asText().trim());
                }
            }

            // 중복 단어 필터링 및 최대 5개 제한 적용
            List<String> uniqueWords = difficultWords.stream()
                    .distinct()
                    .filter(w -> !w.isBlank())
                    .limit(MAX_WORD_SEARCH_COUNT)
                    .toList();

            log.info("[AnalysisService] Gemini 변환 완료. 추출된 단어 개수: {}", uniqueWords.size());

            // 추출된 단어들을 우리말샘 API를 통해 병렬 비동기 조회
            List<CompletableFuture<List<UrimalsaemItem>>> futures =
                    uniqueWords.stream()
                            .map(word -> CompletableFuture.supplyAsync(() -> {
                                try {
                                    String urimalResponse = urimalsaemClient.search(word, 1, 10);
                                    JsonNode urimalRoot = objectMapper.readTree(urimalResponse);
                                    return AnalysisConverter.toUrimalsaemResDTO(urimalRoot).items();
                                } catch (Exception e) {
                                    log.warn("[AnalysisService] 단어 '{}' 조회 중 오류 발생", word, e); // 오류 무시 후 진행
                                    return Collections.<UrimalsaemItem>emptyList();
                                }
                            }, urimalsaemTaskExecutor))
                            .toList();

            // 모든 비동기 태스크 병합 대기
            CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

            // 결과 취합
            List<UrimalsaemItem> wordsResult = futures.stream()
                    .map(CompletableFuture::join)
                    .flatMap(List::stream)
                    .toList();

            return new AnalysisTranslateResDTO(convertedText, wordsResult);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AnalysisService] 쉬운 말 번역 처리 중 오류 발생", e);
            throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
        }
    }

}
