package com.heesik.backend.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "게임 초대 요청 DTO")
public record GameInviteReqDTO(
        @Schema(description = "초대받을 유저 닉네임", example = "홍길동")
        @NotBlank(message = "초대받을 유저 닉네임은 필수입니다.")
        String receiverNickname,

        @Schema(description = "초대할 퀴즈방 ID", example = "10")
        @NotNull(message = "퀴즈방 ID는 필수입니다.")
        Long roomId
) {}
