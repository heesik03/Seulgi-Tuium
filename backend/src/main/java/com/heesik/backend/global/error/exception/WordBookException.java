package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.BaseErrorCode;

public class WordBookException extends BaseException {
    public WordBookException(BaseErrorCode errorCode) {
        super(errorCode);
    }
}
