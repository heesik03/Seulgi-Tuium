package com.heesik.backend.domain.quiz.converter;

import com.heesik.backend.domain.quiz.dto.response.QuizResDTO;
import com.heesik.backend.domain.quiz.entity.Quiz;
import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import com.heesik.backend.domain.user.entity.User;

import java.util.List;
import java.util.stream.Collectors;

public class QuizConverter {

    private QuizConverter() {}

    public static QuizResDTO toQuizResDTO(Quiz quiz) {
        List<QuizResDTO.QuizQuestionResDTO> questionDTOs = quiz.getQuizQuestions().stream()
                .map(QuizConverter::toQuizQuestionResDTO)
                .collect(Collectors.toList());

        return QuizResDTO.builder()
                .quizId(quiz.getId())
                .title(quiz.getTitle())
                .createdAt(quiz.getCreatedAt())
                .questions(questionDTOs)
                .build();
    }

    public static Quiz toQuizEntity(String title, User user) {
        return Quiz.builder()
                .title(title)
                .user(user)
                .build();
    }

    public static QuizQuestion toQuizQuestionEntity(Quiz quiz, String word, String questionText, String correctAnswer, String options) {
        return QuizQuestion.builder()
                .quiz(quiz)
                .word(word)
                .questionText(questionText)
                .correctAnswer(correctAnswer)
                .options(options)
                .build();
    }

    public static QuizResDTO.QuizQuestionResDTO toQuizQuestionResDTO(QuizQuestion question) {
        return QuizResDTO.QuizQuestionResDTO.builder()
                .questionId(question.getId())
                .word(question.getWord())
                .questionText(question.getQuestionText())
                .options(question.getOptions())
                .build();
    }
}
