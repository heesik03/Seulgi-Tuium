package com.heesik.backend.global.error.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum WordBookErrorCode implements BaseErrorCode {

    WORDBOOK_NOT_FOUND(HttpStatus.NOT_FOUND, "WORDBOOK-001", "단어장을 찾을 수 없습니다."),
    WORDBOOK_ACCESS_DENIED(HttpStatus.FORBIDDEN, "WORDBOOK-002", "단어장에 대한 접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    WordBookErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
