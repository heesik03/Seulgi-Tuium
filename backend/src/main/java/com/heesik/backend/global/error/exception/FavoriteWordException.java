package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.BaseErrorCode;

public class FavoriteWordException extends BaseException {
    public FavoriteWordException(BaseErrorCode errorCode) {
        super(errorCode);
    }
}
