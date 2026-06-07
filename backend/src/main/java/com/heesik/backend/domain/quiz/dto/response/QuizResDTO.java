package com.heesik.backend.domain.quiz.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.LocalDateTime;
import java.util.List;

@Builder
@Schema(description = "단어 기반 퀴즈 생성 응답 DTO")
public record QuizResDTO(
        @Schema(description = "퀴즈 ID", example = "1")
        Long quizId,
        @Schema(description = "퀴즈 제목", example = "사과 외 3개의 단어 퀴즈")
        String title,
        @Schema(description = "퀴즈 생성일시")
        LocalDateTime createdAt,
        @Schema(description = "퀴즈 문제 목록")
        List<QuizQuestionResDTO> questions
) {
    @Builder
    @Schema(description = "퀴즈 문제 상세 응답 DTO")
    public record QuizQuestionResDTO(
            @Schema(description = "퀴즈 문제 ID", example = "1")
            Long questionId,
            @Schema(description = "기준 단어", example = "사과")
            String word,
            @Schema(description = "문제 내용", example = "사과의 올바른 뜻은 무엇인가요?")
            String questionText,
            @Schema(description = "4지선다 선택지 JSON", example = "[\"맛있는 과일\", \"채소\", \"고기\", \"해산물\"]")
            String options
    ) {
    }
}
