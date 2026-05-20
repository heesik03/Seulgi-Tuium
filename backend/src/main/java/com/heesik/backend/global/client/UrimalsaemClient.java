package com.heesik.backend.global.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.error.UrimalsaemErrorCode;
import com.heesik.backend.domain.analysis.error.UrimalsaemException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestClient;
import org.springframework.web.util.UriComponentsBuilder;

import java.nio.charset.StandardCharsets;

@Slf4j
@Component
@RequiredArgsConstructor
public class UrimalsaemClient {

    @Value("${urimalsaem_api_key}")
    private String apiKey;

    private final RestClient restClient;
    private final ObjectMapper objectMapper;

    private static final String URIMALSAEM_API_URL = "https://opendict.korean.go.kr/api/search";

    @Retryable(
            retryFor = {HttpServerErrorException.class, HttpClientErrorException.TooManyRequests.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 1000)
    )
    public String search(String query, Integer start, Integer num) {
        long startTime = System.nanoTime();

        String uriString = UriComponentsBuilder.fromUriString(URIMALSAEM_API_URL)
                .queryParam("key", apiKey)
                .queryParam("target_type", "search")
                .queryParam("req_type", "json")
                .queryParam("part", "word")
                .queryParam("q", query)
                .queryParam("sort", "dict")
                .queryParam("start", start)
                .queryParam("num", num)
                .build()
                .toUriString();

        log.info("[우리말샘 API] 요청 시작 - Query: {}, Start: {}, Num: {}", query, start, num);

        return restClient.get()
                .uri(uriString)
                .accept(MediaType.APPLICATION_JSON)
                .exchange((request, response) -> {
                    byte[] bodyBytes = response.getBody().readAllBytes();
                    String bodyString = new String(bodyBytes, StandardCharsets.UTF_8);
                    long durationMs = (System.nanoTime() - startTime) / 1_000_000;

                    // HTTP Network 에러 발생 시 처리
                    if (response.getStatusCode().isError()) {
                        HttpStatus status = (HttpStatus) response.getStatusCode();
                        log.error("[우리말샘 API] HTTP 에러 발생 - Status: {}, Body: {}", status, bodyString);
                        
                        if (status == HttpStatus.TOO_MANY_REQUESTS) {
                            throw new HttpClientErrorException(status, "Rate Limit Exceeded");
                        }
                        if (status.is5xxServerError()) {
                            throw new HttpServerErrorException(status, "Server Error");
                        }
                        throw new UrimalsaemException(UrimalsaemErrorCode.API_CLIENT_ERROR);
                    }

                    checkApiResponseError(bodyString);

                    log.info("[우리말샘 API] 요청 완료 - Latency: {}ms", durationMs);
                    return bodyString;
                });
    }

    /**
     * 우리말샘 API에서 반환하는 JSON 본문 내에 에러 구조가 존재하는지 확인하고,
     * 에러가 있을 시 UrimalsaemException 예외를 던짐.
     */
    private void checkApiResponseError(String responseBody) {
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode errorNode = root.path("error");

            if (!errorNode.isMissingNode()) {
                String errorCode = errorNode.path("error_code").asText();
                String message = errorNode.path("message").asText();

                log.warn("[우리말샘 API] 비즈니스 에러 발생 - Code: {}, Message: {}", errorCode, message);

                UrimalsaemErrorCode apiErrorCode = UrimalsaemErrorCode.fromCode(errorCode);
                throw new UrimalsaemException(apiErrorCode);
            }
        } catch (UrimalsaemException e) {
            throw e;
        } catch (Exception e) {
            log.error("[우리말샘 API] 응답 에러 검사 중 파싱 오류 발생. 수신된 응답 본문:\n{}", responseBody, e);
            throw new UrimalsaemException(UrimalsaemErrorCode.JSON_PARSING_ERROR);
        }
    }
}
