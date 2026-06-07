package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "단어 퀴즈 문제 출제 응답 DTO")
public record GameQuestionResDTO(
        @Schema(description = "게임방 ID", example = "10")
        Long roomId,

        @Schema(description = "출제된 단어의 정의(뜻)", example = "붉고 아삭아삭한 가을 대표 과일")
        String definition,

        @Schema(description = "정답 단어의 글자 수 힌트", example = "2")
        Integer wordLength,

        @Schema(description = "문제 풀이 제한 시간(초 단위)", example = "10")
        Integer limitSeconds
) {}
