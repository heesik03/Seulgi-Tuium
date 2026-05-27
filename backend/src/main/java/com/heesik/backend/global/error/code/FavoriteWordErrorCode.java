package com.heesik.backend.global.error.code;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public enum FavoriteWordErrorCode implements BaseErrorCode {

    FAVORITE_WORD_NOT_FOUND(HttpStatus.NOT_FOUND, "FAVORITE-001", "즐겨찾기 단어를 찾을 수 없습니다."),
    FAVORITE_WORD_ACCESS_DENIED(HttpStatus.FORBIDDEN, "FAVORITE-002", "해당 즐겨찾기 단어에 대한 접근 권한이 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    FavoriteWordErrorCode(HttpStatus status, String code, String message) {
        this.status = status;
        this.code = code;
        this.message = message;
    }
}
