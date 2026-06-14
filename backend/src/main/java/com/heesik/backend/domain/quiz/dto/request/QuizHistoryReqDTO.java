package com.heesik.backend.domain.quiz.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "퀴즈 풀이 답안 제출 요청 DTO")
public record QuizHistoryReqDTO(
        @Schema(description = "제출한 문제 답안 목록 (무조건 4개 문제에 대한 답안)", requiredMode = Schema.RequiredMode.REQUIRED)
        @NotNull(message = "답안 목록은 필수입니다.")
        @Size(min = 4, max = 4, message = "4개의 문제에 대한 답안을 모두 제출해야 합니다.")
        @Valid
        List<AnswerSubmitDTO> answers
) {
    @Schema(description = "개별 문제 답안 제출 DTO")
    public record AnswerSubmitDTO(
            @Schema(description = "문제 ID", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
            @NotNull(message = "문제 ID는 필수입니다.")
            Long questionId,

            @Schema(description = "사용자가 선택한 답안 번호 (1, 2, 3, 4 중 하나)", example = "1", requiredMode = Schema.RequiredMode.REQUIRED)
            @NotBlank(message = "제출 답안은 필수입니다.")
            @Pattern(regexp = "^[1-4]$", message = "제출 답안은 1에서 4 사이의 번호여야 합니다.")
            String submittedAnswer
    ) {
    }
}
