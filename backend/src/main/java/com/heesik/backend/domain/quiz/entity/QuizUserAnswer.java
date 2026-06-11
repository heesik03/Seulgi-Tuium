package com.heesik.backend.domain.quiz.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "quiz_user_answer")
public class QuizUserAnswer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_history_id", nullable = false)
    private QuizHistory quizHistory;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_question_id", nullable = false)
    private QuizQuestion quizQuestion;

    @Column(name = "submitted_answer", nullable = false, columnDefinition = "CHAR(1)")
    private String submittedAnswer;

    @Column(name = "is_correct", nullable = false)
    private Boolean isCorrect;

    @Builder
    public QuizUserAnswer(QuizHistory quizHistory, QuizQuestion quizQuestion, String submittedAnswer, Boolean isCorrect) {
        this.quizHistory = quizHistory;
        this.quizQuestion = quizQuestion;
        this.submittedAnswer = submittedAnswer;
        this.isCorrect = isCorrect;
        if (quizHistory != null) {
            quizHistory.addQuizUserAnswer(this);
        }
    }
}
