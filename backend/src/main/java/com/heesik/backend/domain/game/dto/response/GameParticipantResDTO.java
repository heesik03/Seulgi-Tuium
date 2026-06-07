package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "게임 참가자 실시간 상태 정보 응답 DTO")
public record GameParticipantResDTO(
        @Schema(description = "참가자 유저 ID", example = "1")
        Long userId,

        @Schema(description = "참가자 이름", example = "홍길동")
        String name,

        @Schema(description = "방장 여부", example = "true")
        Boolean isHost,

        @Schema(description = "준비 완료 여부", example = "false")
        Boolean isReady
) {}
