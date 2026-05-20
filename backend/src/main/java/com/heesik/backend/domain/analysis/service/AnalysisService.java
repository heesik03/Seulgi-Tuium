package com.heesik.backend.domain.analysis.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.converter.AnalysisConverter;
import com.heesik.backend.domain.analysis.dto.request.AnalysisTranslateReqDTO;
import com.heesik.backend.domain.analysis.dto.request.UrimalsaemReqDTO;
import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO.UrimalsaemItem;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
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

    private String systemInstruction;
    private String userPromptTemplate;

    private static final int MAX_WORD_SEARCH_COUNT = 5; // 어려운 말 번역기 최대 검색 단어 개수

    // 프롬프트 파일 읽음
    @PostConstruct
    private void loadPrompts() throws IOException {
        systemInstruction = new String(
                new ClassPathResource("prompts/translate_system.txt").getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        ).strip();
        userPromptTemplate = new String(
                new ClassPathResource("prompts/translate_user.txt").getInputStream().readAllBytes(),
                StandardCharsets.UTF_8
        ).strip();
        log.info("[AnalysisService] Gemini 프롬프트 파일 로드 완료");
    }

    /** 우리말샘 OpenAPI를 호출하여 단어를 검색하고, 결과를 변환하여 반환함. */
    public UrimalsaemResDTO searchUrimalsaem(UrimalsaemReqDTO request) {
        log.info("[AnalysisService] 단어 검색 요청 처리 시작 - Keyword: {}", request.q());

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

    /**
     * Gemini 3.1 Flash API를 호출하여 어려운 말을 쉬운 말로 변환하고
     * 동시에 추출된 어려운 단어들의 뜻풀이를 우리말샘 API를 통해 병렬로 조회함.
     */
    public AnalysisTranslateResDTO translateAndSearch(AnalysisTranslateReqDTO request) {
        log.info("[AnalysisService] 쉬운 말 번역 및 단어 뜻 검색 시작 - Text Length: {}", request.text().length());

        try {
            // Gemini Structured Output 요청 정의
            String userPrompt = userPromptTemplate.replace("{text}", request.text());
            Map<String, Object> responseSchema = Map.of(
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
            Map<String, Object> geminiRequestBody = GeminiRequestBuilder.buildStructuredOutputBody(
                    systemInstruction, userPrompt, responseSchema
            );
            String geminiRawResponse = geminiClient.sendRequest(geminiRequestBody);

            // Gemini 응답 구조 파싱 (convertedText, difficultWords 추출)
            JsonNode root = objectMapper.readTree(geminiRawResponse);
            JsonNode candidateNode = root.path("candidates").get(0)
                    .path("content").path("parts").get(0);

            String jsonText = candidateNode.path("text").asText().trim();
            JsonNode structuredResult = objectMapper.readTree(jsonText);

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
                                    log.warn("[AnalysisService] 단어 '{}' 조회 중 오류 발생 (무시하고 진행)", word, e);
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
