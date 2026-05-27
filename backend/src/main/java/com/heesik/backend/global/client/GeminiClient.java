package com.heesik.backend.global.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.global.error.code.GeminiErrorCode;
import com.heesik.backend.global.error.exception.GeminiException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClient;

import java.nio.charset.StandardCharsets;
import java.util.Map;

@Slf4j
@Component
@RequiredArgsConstructor
public class GeminiClient {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private static final String GEMINI_3_1_FLASH
            = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent";

    /**
        Gemini API를 호출. 특정 예외(HttpServerErrorException, 429 Too Many Requests) 발생 시에만 최대 3회 재시도함.
     */
    @Retryable(
            retryFor = {HttpServerErrorException.class, HttpClientErrorException.TooManyRequests.class},
            maxAttempts = 3,
            backoff = @Backoff(
                    delay = 300,
                    multiplier = 2
            )
    )
    public String sendRequest(Map<String, Object> requestBody) {
        long startTime = System.nanoTime();

        return restClient.post()
                .uri(GEMINI_3_1_FLASH + "?key=" + apiKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(requestBody)
                .exchange((request, response) -> {
                    byte[] bodyBytes = response.getBody().readAllBytes();
                    String bodyString = new String(bodyBytes, StandardCharsets.UTF_8);
                    long durationMs = (System.nanoTime() - startTime) / 1_000_000;

                    // 에러 발생 시 상태 코드별 예외 분리 처리
                    if (response.getStatusCode().isError()) {
                        HttpStatus status = (HttpStatus) response.getStatusCode();
                        if (status == HttpStatus.TOO_MANY_REQUESTS) {
                            throw new HttpClientErrorException(status, "Rate Limit Exceeded");
                        }
                        if (status.is5xxServerError()) {
                            throw new HttpServerErrorException(status, "Server Error");
                        }
                        throw new GeminiException(
                                switch (status) {
                                    case BAD_REQUEST -> GeminiErrorCode.GEMINI_BAD_REQUEST;
                                    case UNAUTHORIZED -> GeminiErrorCode.GEMINI_UNAUTHORIZED;
                                    case FORBIDDEN -> GeminiErrorCode.GEMINI_FORBIDDEN;
                                    case NOT_FOUND -> GeminiErrorCode.GEMINI_NOT_FOUND;
                                    default -> GeminiErrorCode.GEMINI_INTERNAL_SERVER_ERROR;
                                }
                        );
                    }
                    // 정상 응답 로깅 및 반환
                    logTokenUsage(bodyString, durationMs);
                    return bodyString;
                });
    }

    private void logTokenUsage(String responseBody, long durationMs) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode usage = root.path("usageMetadata");

            if (!usage.isMissingNode()) {
                int promptTokens = usage.path("promptTokenCount").asInt(0);
                int candidateTokens = usage.path("candidatesTokenCount").asInt(0);
                int cachedTokens = usage.path("cachedContentTokenCount").asInt(0);
                int thoughtsTokens = usage.path("thoughtsTokenCount").asInt(0);
                int totalTokens = usage.path("totalTokenCount").asInt(0);

                log.info("[Gemini API] Latency: {}ms | Tokens - Prompt: {} (Cached: {}), Candidate: {} (Thoughts: {}), Total: {}",
                        durationMs, promptTokens, cachedTokens, candidateTokens, thoughtsTokens, totalTokens);
            }
        } catch (Exception e) {
            log.warn("Failed to parse token usage metadata", e);
        }
    }

}
