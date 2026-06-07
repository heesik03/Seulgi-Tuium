package com.heesik.backend.domain.game.dto.request;

import com.heesik.backend.domain.game.enums.GameMessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "게임방 웹소켓 메시지 전송 요청 DTO")
public record GameMessageReqDTO(
        @Schema(description = "게임방 ID", example = "10")
        @NotNull(message = "방 ID는 필수입니다.")
        Long roomId,

        @Schema(description = "메시지 타입", example = "TALK")
        @NotNull(message = "메시지 타입은 필수입니다.")
        GameMessageType type,

        @Schema(description = "메시지 내용", example = "안녕하세요!")
        @NotBlank(message = "메시지 내용은 비어둘 수 없습니다.")
        String message,

        @Schema(description = "위임 대상 유저 ID (방장 위임 시에만 사용)", example = "2")
        Long targetUserId
) {}
