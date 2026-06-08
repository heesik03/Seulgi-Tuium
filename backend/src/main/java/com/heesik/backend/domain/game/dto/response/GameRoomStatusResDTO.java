package com.heesik.backend.domain.game.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "게임방 전체 실시간 상태 동기화 응답 DTO")
public record GameRoomStatusResDTO(
        @Schema(description = "게임방 ID", example = "10")
        Long roomId,

        @Schema(description = "게임방 제목", example = "헌법 기초 퀴즈")
        String title,

        @Schema(description = "참가자 목록")
        List<GameParticipantResDTO> participants
) {}
