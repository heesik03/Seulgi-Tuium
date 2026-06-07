package com.heesik.backend.domain.game.converter;

import com.heesik.backend.domain.game.dto.response.GameParticipantResDTO;
import com.heesik.backend.domain.game.dto.response.GameRoomStatusResDTO;
import com.heesik.backend.domain.game.model.GameParticipant;
import com.heesik.backend.domain.game.model.GameRoom;

import java.util.List;

public class GameRoomConverter {

    private GameRoomConverter() {}

    public static GameParticipantResDTO toParticipantResDTO(GameParticipant participant) {
        return new GameParticipantResDTO(
                participant.getUserId(),
                participant.getName(),
                participant.getIsHost(),
                participant.getIsReady()
        );
    }

    public static GameRoomStatusResDTO toRoomStatusResDTO(GameRoom room) {
        List<GameParticipantResDTO> participantDTOs = room.getParticipants().stream()
                .map(GameRoomConverter::toParticipantResDTO)
                .toList();

        return new GameRoomStatusResDTO(room.getRoomId(), participantDTOs);
    }
}
