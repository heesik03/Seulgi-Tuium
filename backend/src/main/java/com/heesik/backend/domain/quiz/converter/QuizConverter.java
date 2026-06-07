package com.heesik.backend.domain.quiz.converter;

import com.heesik.backend.domain.quiz.dto.response.QuizResDTO;
import com.heesik.backend.domain.quiz.entity.Quiz;
import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import com.heesik.backend.domain.user.entity.User;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class QuizConverter {

    public QuizResDTO toQuizResDTO(Quiz quiz) {
        List<QuizResDTO.QuizQuestionResDTO> questionDTOs = quiz.getQuizQuestions().stream()
                .map(this::toQuizQuestionResDTO)
                .collect(Collectors.toList());

        return QuizResDTO.builder()
                .quizId(quiz.getId())
                .title(quiz.getTitle())
                .createdAt(quiz.getCreatedAt())
                .questions(questionDTOs)
                .build();
    }

    public Quiz toQuizEntity(String title, User user) {
        return Quiz.builder()
                .title(title)
                .user(user)
                .build();
    }

    public QuizQuestion toQuizQuestionEntity(Quiz quiz, String word, String questionText, String correctAnswer, String options) {
        return QuizQuestion.builder()
                .quiz(quiz)
                .word(word)
                .questionText(questionText)
                .correctAnswer(correctAnswer)
                .options(options)
                .build();
    }

    public QuizResDTO.QuizQuestionResDTO toQuizQuestionResDTO(QuizQuestion question) {
        return QuizResDTO.QuizQuestionResDTO.builder()
                .questionId(question.getId())
                .word(question.getWord())
                .questionText(question.getQuestionText())
                .options(question.getOptions())
                .build();
    }
}
