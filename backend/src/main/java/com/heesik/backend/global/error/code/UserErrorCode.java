package com.heesik.backend.global.error.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum UserErrorCode implements BaseErrorCode {

    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "USER-001", "사용자를 찾을 수 없습니다."),
    INVALID_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "USER-002", "유효하지 않은 리프레시 토큰입니다."),
    EXPIRED_REFRESH_TOKEN(HttpStatus.UNAUTHORIZED, "USER-003", "리프레시 토큰이 만료되었습니다. 다시 로그인하세요."),
    INVALID_JWT_SIGNATURE(HttpStatus.UNAUTHORIZED, "USER-004", "잘못된 JWT 서명입니다."),
    EXPIRED_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "USER-005", "만료된 JWT 토큰입니다."),
    UNSUPPORTED_JWT_TOKEN(HttpStatus.UNAUTHORIZED, "USER-006", "지원되지 않는 JWT 토큰입니다."),
    EMPTY_JWT_CLAIM(HttpStatus.UNAUTHORIZED, "USER-007", "JWT 토큰이 비어있습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    UserErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }

}
