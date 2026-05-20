package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.GeminiErrorCode;

public class GeminiException extends BaseException {
    public GeminiException(GeminiErrorCode errorCode) {
        super(errorCode);
    }
}
