package com.heesik.backend.domain.training.dto.request;

import com.heesik.backend.domain.training.enums.TrainingDifficulty;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Builder;

@Schema(description = "문장 훈련 분할 요청 DTO")
public record SentenceTrainingReqDTO(
        @Schema(description = "분할할 원본 텍스트", example = "나는 오늘 학교에 가서 공부를 했다.")
        @NotBlank(message = "텍스트는 필수입니다.")
        String text,

        @Schema(description = "분할 난이도", example = "NORMAL")
        @NotNull(message = "난이도는 필수입니다.")
        TrainingDifficulty difficulty
) {
}
