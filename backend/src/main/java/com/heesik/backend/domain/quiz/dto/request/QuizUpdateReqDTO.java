package com.heesik.backend.domain.quiz.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "퀴즈 수정 요청 DTO")
public record QuizUpdateReqDTO(
        @Schema(description = "수정할 퀴즈 제목", example = "새로운 퀴즈 제목", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotBlank(message = "퀴즈 제목은 필수입니다.")
        @Size(max = 120, message = "퀴즈 제목은 최대 120자까지 가능합니다.")
        String title
) {
}
