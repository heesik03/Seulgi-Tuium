package com.heesik.backend.domain.quiz.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;
import java.util.List;

@Builder
@Schema(description = "퀴즈 풀이 이력 및 채점 결과 응답 DTO")
public record QuizHistoryResDTO(
        @Schema(description = "퀴즈 풀이 이력 ID", example = "1")
        Long historyId,
        @Schema(description = "풀이한 퀴즈 ID", example = "1")
        Long quizId,
        @Schema(description = "풀이한 퀴즈 제목", example = "사과 외 3개의 단어 퀴즈")
        String quizTitle,
        @Schema(description = "총 획득 점수 (예: 100점 만점)", example = "75")
        Integer score,
        @Schema(description = "풀이 일시")
        LocalDateTime solvedAt,
        @Schema(description = "개별 문제 풀이 결과 목록")
        List<AnswerResultResDTO> results
) {
    @Builder
    @Schema(description = "개별 문제 풀이 결과 DTO")
    public record AnswerResultResDTO(
            @Schema(description = "제출 답안 ID", example = "1")
            Long answerId,
            @Schema(description = "문제 ID", example = "1")
            Long questionId,
            @Schema(description = "제출한 답안 번호", example = "1")
            String submittedAnswer,
            @Schema(description = "실제 정답 번호", example = "2")
            String correctAnswer,
            @Schema(description = "정답 여부", example = "false")
            Boolean isCorrect
    ) {
    }
}
