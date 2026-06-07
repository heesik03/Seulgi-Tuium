package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "게임 초대 응답 DTO")
public record GameInviteResDTO(
        @Schema(description = "초대한 유저 ID", example = "1")
        Long senderId,

        @Schema(description = "초대한 유저 이름", example = "홍길동")
        String senderName,

        @Schema(description = "초대받은 퀴즈방 ID", example = "10")
        Long roomId,

        @Schema(description = "초대 시각")
        LocalDateTime invitedAt
) {}
