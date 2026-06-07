package com.heesik.backend.domain.game.converter;

import com.heesik.backend.domain.game.dto.response.GameInviteResDTO;
import com.heesik.backend.domain.user.entity.User;

import java.time.LocalDateTime;

public class GameInviteConverter {

    private GameInviteConverter() {}

    public static GameInviteResDTO toResDTO(User sender, Long roomId) {
        return new GameInviteResDTO(
                sender.getId(),
                sender.getName(),
                roomId,
                LocalDateTime.now()
        );
    }
}
