package com.heesik.backend.domain.game.converter;

import com.heesik.backend.domain.game.dto.request.GameMessageReqDTO;
import com.heesik.backend.domain.game.dto.response.GameMessageResDTO;
import com.heesik.backend.domain.game.enums.GameMessageType;
import com.heesik.backend.domain.user.entity.User;

import java.time.LocalDateTime;

public final class GameMessageConverter {

    private GameMessageConverter() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // 일반 채팅 메시지 변환
    public static GameMessageResDTO toResDTO(GameMessageReqDTO reqDTO, Long userId, String userName) {
        return new GameMessageResDTO(
                reqDTO.roomId(),
                userId,
                userName,
                reqDTO.type(),
                reqDTO.message(),
                LocalDateTime.now(),
                null
        );
    }

    // 시스템 전송용 메시지 변환
    public static GameMessageResDTO toSystemResDTO(Long roomId, Long userId, String userName, String systemMessage, GameMessageType type) {
        return new GameMessageResDTO(
                roomId,
                userId,
                userName,
                type,
                systemMessage,
                LocalDateTime.now(),
                null
        );
    }

    // 정답 판별 처리를 지닌 전송용 메시지 변환
    public static GameMessageResDTO toSystemResDTO(Long roomId, Long userId, String userName, String systemMessage, GameMessageType type, Boolean isCorrect) {
        return new GameMessageResDTO(
                roomId,
                userId,
                userName,
                type,
                systemMessage,
                LocalDateTime.now(),
                isCorrect
        );
    }
}
