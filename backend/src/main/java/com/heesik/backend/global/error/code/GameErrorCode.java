package com.heesik.backend.global.error.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum GameErrorCode implements BaseErrorCode {
    GAME_ALREADY_STARTED(HttpStatus.BAD_REQUEST, "GAME_001", "이미 시작된 게임방입니다."),
    GAME_NOT_HOST(HttpStatus.FORBIDDEN, "GAME_002", "방장만 해당 권한을 수행할 수 있습니다."),
    GAME_ROOM_NOT_FOUND(HttpStatus.NOT_FOUND, "GAME_003", "게임방 정보를 찾을 수 없습니다."),
    GAME_ROOM_FULL(HttpStatus.BAD_REQUEST, "GAME_004", "게임방 정원이 초과되었습니다."),
    GAME_NOT_STARTED(HttpStatus.BAD_REQUEST, "GAME_005", "아직 시작되지 않은 게임방입니다."),
    INSUFFICIENT_WORDS(HttpStatus.INTERNAL_SERVER_ERROR, "GAME_006", "퀴즈를 진행하기 위한 단어가 충분하지 않습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}
