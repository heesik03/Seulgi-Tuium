package com.heesik.backend.domain.training.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.training.converter.SentenceTrainingConverter;
import com.heesik.backend.domain.training.dto.response.SentenceComponentResDTO;
import com.heesik.backend.global.client.GeminiClient;
import com.heesik.backend.global.error.code.GeminiErrorCode;
import com.heesik.backend.global.error.exception.GeminiException;
import com.heesik.backend.global.util.GeminiRequestBuilder;
import com.heesik.backend.global.util.GeminiResponseParser;
import com.heesik.backend.global.util.PromptProvider;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class GeminiSemanticAnalyzer {

    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final PromptProvider promptProvider;

    private String systemInstructionTemplate;
    private static final Map<String, Object> RESPONSE_SCHEMA = Map.of(
            "type", "ARRAY",
            "description", "문장을 의미 단위로 분할한 결과 배열",
            "items", Map.of(
                    "type", "OBJECT",
                    "properties", Map.of(
                            "text", Map.of(
                                    "type", "STRING",
                                    "description", "분할된 의미 단위 텍스트 (예: '기동대를 투입해')"
                            ),
                            "role", Map.of(
                                    "type", "STRING",
                                    "enum", List.of("SUBJECT", "OBJECT", "PREDICATE", "CAUSE", "RESULT", "OTHER"),
                                    "description", "해당 텍스트의 의미 역할"
                            )
                    ),
                    "required", List.of("text", "role")
            )
    );

    private String userPromptTemplate;

    @PostConstruct
    private void loadPrompts() {
        userPromptTemplate = promptProvider.loadPrompt("prompts/sentence_analysis_user.txt");
        systemInstructionTemplate = promptProvider.loadPrompt("prompts/sentence_analysis_system.txt");
    }

    public List<SentenceComponentResDTO> analyze(String sentenceText) {
        try {
            String userPrompt = promptProvider.buildPrompt(
                    userPromptTemplate,
                    Map.of("text", sentenceText)
            );

            Map<String, Object> requestBody = GeminiRequestBuilder.buildStructuredOutputBody(
                    systemInstructionTemplate, userPrompt, RESPONSE_SCHEMA
            );

            String rawResponse = geminiClient.sendRequest(requestBody);
            
            // Structured Output 파싱
            JsonNode structuredResult = GeminiResponseParser.extractStructuredOutput(rawResponse, objectMapper);

            // JsonNode(Array) -> DTO 변환
            return SentenceTrainingConverter.toSentenceComponentResDTOList(structuredResult);
        } catch (GeminiException e) {
            log.error("[GeminiSemanticAnalyzer] Gemini API 분석 실패", e);
            throw e;
        } catch (Exception e) {
            log.error("[GeminiSemanticAnalyzer] 예기치 않은 오류 발생", e);
            throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
        }
    }
}
