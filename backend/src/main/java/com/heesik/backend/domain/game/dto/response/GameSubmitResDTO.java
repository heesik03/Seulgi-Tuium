package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "제출된 답변의 정답 여부 및 피드백 응답 DTO")
public record GameSubmitResDTO(
        @Schema(description = "게임방 ID", example = "10")
        Long roomId,

        @Schema(description = "제출자 유저 ID", example = "1")
        Long userId,

        @Schema(description = "제출자 이름", example = "홍길동")
        String userName,

        @Schema(description = "제출한 단어", example = "사과")
        String submitWord,

        @Schema(description = "정답 여부", example = "true")
        Boolean isCorrect,

        @Schema(description = "현재 획득 점수 (누적 스코어)", example = "10")
        Integer score
) {}
