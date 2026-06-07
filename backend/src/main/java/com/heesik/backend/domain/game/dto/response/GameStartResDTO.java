package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "게임 시작 응답 DTO")
public record GameStartResDTO(
        @Schema(description = "게임방 ID", example = "10")
        Long roomId,

        @Schema(description = "게임 시작 여부", example = "true")
        Boolean isStarted,

        @Schema(description = "시스템 메시지", example = "퀴즈가 잠시 후 시작됩니다!")
        String message,

        @Schema(description = "시작 시각")
        LocalDateTime startedAt
) {}
