package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.QuizErrorCode;

public class QuizException extends BaseException {
    public QuizException(QuizErrorCode errorCode) {
        super(errorCode);
    }
}
