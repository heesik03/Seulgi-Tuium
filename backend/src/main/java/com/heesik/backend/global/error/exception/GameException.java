package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.GameErrorCode;

public class GameException extends BaseException {
    
    // 게임 도메인 예외 생성자
    public GameException(GameErrorCode errorCode) {
        super(errorCode);
    }
}
