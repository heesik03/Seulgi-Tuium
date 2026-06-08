package com.heesik.backend.domain.game.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

@Schema(description = "게임방 생성 요청 DTO")
public record GameRoomReqDTO(
        @Schema(description = "게임방 제목", example = "헌법 기초 퀴즈")
        @NotBlank(message = "방 제목은 필수입니다.")
        String title,

        @Schema(description = "선택된 단어 목록 (백엔드 출제 로직이 랜덤 4단어이므로 요청은 받되 무시됩니다)", example = "[\"헌법\", \"기본권\"]")
        List<String> words,

        @Schema(description = "퀴즈 개수 (고정 4문제 출제이므로 요청은 받되 무시됩니다)", example = "4")
        Integer quizCount
) {}
