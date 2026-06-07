package com.heesik.backend.domain.quiz.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(description = "단어 기반 퀴즈 생성 요청 DTO")
public record QuizReqDTO(
        @Schema(description = "퀴즈를 생성할 단어 목록 (4개 이상 10개 이하)", example = "[\"사과\", \"바나나\", \"포도\", \"수박\"]")
        @NotNull(message = "단어 목록은 필수입니다.")
        @Size(min = 4, max = 10, message = "단어는 최소 4개에서 최대 10개까지 입력 가능합니다.")
        List<String> words
) {
}
