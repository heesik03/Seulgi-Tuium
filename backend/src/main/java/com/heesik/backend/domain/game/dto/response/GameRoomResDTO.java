package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "게임방 생성 응답 DTO")
public record GameRoomResDTO(
        @Schema(description = "생성된 방 ID", example = "1")
        Long roomId,

        @Schema(description = "방 제목", example = "헌법 기초 퀴즈")
        String title
) {}
