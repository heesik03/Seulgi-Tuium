package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.BaseErrorCode;
import lombok.Getter;

@Getter
public abstract class BaseException extends RuntimeException {
    private final BaseErrorCode errorCode;

    protected BaseException(BaseErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }
}