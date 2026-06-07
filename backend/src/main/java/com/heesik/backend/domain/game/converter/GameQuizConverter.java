package com.heesik.backend.domain.game.converter;

import com.heesik.backend.domain.game.dto.response.GameQuestionResDTO;
import com.heesik.backend.domain.game.dto.response.GameSubmitResDTO;
import com.heesik.backend.domain.game.model.GameRoom;
import com.heesik.backend.domain.user.entity.User;

public final class GameQuizConverter {

    private GameQuizConverter() {
        throw new UnsupportedOperationException("This is a utility class and cannot be instantiated");
    }

    // 출제 정보 DTO 변환 (10초 제한 설정 포함)
    public static GameQuestionResDTO toQuestionResDTO(GameRoom room) {
        String definition = room.getCurrentDefinition();
        Integer length = room.getCurrentWord() != null ? room.getCurrentWord().length() : 0;
        return new GameQuestionResDTO(room.getRoomId(), definition, length, 10);
    }

    // 채점 결과 DTO 변환
    public static GameSubmitResDTO toSubmitResDTO(GameRoom room, Long userId, String userName, String submitWord, Boolean isCorrect) {
        Integer score = room.getScore(userId);
        return new GameSubmitResDTO(
                room.getRoomId(),
                userId,
                userName,
                submitWord,
                isCorrect,
                score
        );
    }
}
