package com.heesik.backend.domain.quiz.converter;

import com.heesik.backend.domain.quiz.dto.response.QuizHistoryResDTO;
import com.heesik.backend.domain.quiz.entity.Quiz;
import com.heesik.backend.domain.quiz.entity.QuizHistory;
import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import com.heesik.backend.domain.quiz.entity.QuizUserAnswer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

public class QuizHistoryConverter {

    private QuizHistoryConverter() {
    }

    public static QuizHistoryResDTO toQuizHistoryResDTO(QuizHistory history) {
        List<QuizHistoryResDTO.AnswerResultResDTO> resultDTOs = history.getQuizUserAnswers().stream()
                .map(QuizHistoryConverter::toAnswerResultResDTO)
                .collect(Collectors.toList());

        return QuizHistoryResDTO.builder()
                .historyId(history.getId())
                .quizId(history.getQuiz().getId())
                .quizTitle(history.getQuiz().getTitle())
                .score(history.getScore())
                .solvedAt(history.getSolvedAt())
                .results(resultDTOs)
                .build();
    }

    public static QuizHistory toQuizHistoryEntity(Quiz quiz, int score, LocalDateTime solvedAt) {
        return QuizHistory.builder()
                .quiz(quiz)
                .score(score)
                .solvedAt(solvedAt)
                .build();
    }

    public static QuizUserAnswer toQuizUserAnswerEntity(QuizHistory quizHistory, QuizQuestion quizQuestion, String submittedAnswer, boolean isCorrect) {
        return QuizUserAnswer.builder()
                .quizHistory(quizHistory)
                .quizQuestion(quizQuestion)
                .submittedAnswer(submittedAnswer)
                .isCorrect(isCorrect)
                .build();
    }

    public static QuizHistoryResDTO.AnswerResultResDTO toAnswerResultResDTO(QuizUserAnswer answer) {
        return QuizHistoryResDTO.AnswerResultResDTO.builder()
                .answerId(answer.getId())
                .questionId(answer.getQuizQuestion().getId())
                .submittedAnswer(answer.getSubmittedAnswer())
                .correctAnswer(answer.getQuizQuestion().getCorrectAnswer())
                .isCorrect(answer.getIsCorrect())
                .build();
    }
}
