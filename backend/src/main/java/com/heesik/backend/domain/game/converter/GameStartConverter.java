package com.heesik.backend.domain.game.converter;

import com.heesik.backend.domain.game.dto.response.GameStartResDTO;
import com.heesik.backend.domain.game.model.GameRoom;

import java.time.LocalDateTime;

public class GameStartConverter {

    private GameStartConverter() {}

    public static GameStartResDTO toResDTO(GameRoom room, String message) {
        return new GameStartResDTO(
                room.getRoomId(),
                room.getIsStarted(),
                message,
                LocalDateTime.now()
        );
    }
}
