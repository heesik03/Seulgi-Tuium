package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.UserErrorCode;

public class UserException extends BaseException {
    public UserException(UserErrorCode userErrorCode) {
        super(userErrorCode);
    }
}