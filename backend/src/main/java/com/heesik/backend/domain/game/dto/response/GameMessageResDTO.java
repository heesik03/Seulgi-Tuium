package com.heesik.backend.domain.game.dto.response;

import com.heesik.backend.domain.game.enums.GameMessageType;
import io.swagger.v3.oas.annotations.media.Schema;
import java.time.LocalDateTime;

@Schema(description = "게임방 웹소켓 메시지 응답 DTO")
public record GameMessageResDTO(
        @Schema(description = "게임방 ID", example = "10")
        Long roomId,

        @Schema(description = "송신자 ID", example = "1")
        Long senderId,

        @Schema(description = "송신자 이름", example = "홍길동")
        String senderName,

        @Schema(description = "메시지 타입", example = "TALK")
        GameMessageType type,

        @Schema(description = "메시지 내용", example = "안녕하세요!")
        String message,

        @Schema(description = "전송 시각")
        LocalDateTime sentAt,

        @Schema(description = "정답 여부 (SUBMIT 타입일 때만 활성화)", example = "true")
        Boolean isCorrect
) {}
