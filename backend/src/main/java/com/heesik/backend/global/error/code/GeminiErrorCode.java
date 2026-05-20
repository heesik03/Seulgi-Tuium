package com.heesik.backend.global.error.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum GeminiErrorCode implements BaseErrorCode {
    // 4xx Client Errors
    GEMINI_BAD_REQUEST(HttpStatus.BAD_REQUEST, "GEMINI_400", "잘못된 요청입니다."),
    GEMINI_UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "GEMINI_401", "API 키가 유효하지 않습니다."),
    GEMINI_FORBIDDEN(HttpStatus.FORBIDDEN, "GEMINI_403", "접근 권한이 없습니다."),
    GEMINI_NOT_FOUND(HttpStatus.NOT_FOUND, "GEMINI_404", "모델을 찾을 수 없습니다."),
    GEMINI_TOO_MANY_REQUESTS(HttpStatus.TOO_MANY_REQUESTS, "GEMINI_429", "요청 제한(Rate Limit)을 초과했습니다."),

    // 5xx Server Errors
    GEMINI_INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "GEMINI_500", "Gemini 서버 내부 오류입니다."),
    GEMINI_SERVICE_UNAVAILABLE(HttpStatus.SERVICE_UNAVAILABLE, "GEMINI_503", "Gemini 서비스를 현재 사용할 수 없습니다."),

    // Custom Errors
    GEMINI_PARSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "GEMINI_900", "응답 데이터 파싱 중 오류가 발생했습니다.");


    private final HttpStatus status;
    private final String code;
    private final String message;
}
