package com.heesik.backend.global.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.global.error.code.GeminiErrorCode;
import com.heesik.backend.global.error.exception.GeminiException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class GeminiResponseParser {

    /**
     * Gemini API raw 응답 JSON 스트링에서 실제 반환 텍스트(parts[0].text)를 추출합니다.
     */
    public static String extractText(String rawResponse, ObjectMapper objectMapper) {
        try {
            JsonNode root = objectMapper.readTree(rawResponse);
            JsonNode candidate = root.path("candidates").get(0);
            if (candidate == null || candidate.isMissingNode()) {
                throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
            }
            
            JsonNode parts = candidate.path("content").path("parts");
            if (parts == null || parts.isMissingNode() || !parts.isArray() || parts.isEmpty()) {
                throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
            }

            JsonNode textNode = parts.get(0).path("text");
            if (textNode == null || textNode.isMissingNode()) {
                throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
            }

            return textNode.asText().trim();
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to extract text from Gemini response", e);
            throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
        }
    }

    /**
     * Gemini Structured Output 응답을 파싱하여 JsonNode 객체로 반환합니다.
     */
    public static JsonNode extractStructuredOutput(String rawResponse, ObjectMapper objectMapper) {
        try {
            String jsonText = extractText(rawResponse, objectMapper);
            return objectMapper.readTree(jsonText);
        } catch (GeminiException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Gemini structured output", e);
            throw new GeminiException(GeminiErrorCode.GEMINI_PARSING_ERROR);
        }
    }
}
