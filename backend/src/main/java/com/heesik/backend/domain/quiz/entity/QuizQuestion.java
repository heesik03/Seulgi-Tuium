package com.heesik.backend.domain.quiz.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(name = "quiz_question")
public class QuizQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_question_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "word", nullable = false, length = 255)
    private String word;

    @Column(name = "question_text", nullable = false, columnDefinition = "TEXT")
    private String questionText;

    @Column(name = "correct_answer", nullable = false, length = 255)
    private String correctAnswer;

    @Column(name = "options", nullable = false, columnDefinition = "TEXT")
    private String options; // 4지선다 선택지 (JSON 또는 콤마 구분)

    @OneToMany(mappedBy = "quizQuestion", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizUserAnswer> quizUserAnswers = new ArrayList<>();

    @Builder
    public QuizQuestion(Quiz quiz, String word, String questionText, String correctAnswer, String options) {
        this.quiz = quiz;
        this.word = word;
        this.questionText = questionText;
        this.correctAnswer = correctAnswer;
        this.options = options;
        if (quiz != null) {
            quiz.addQuizQuestion(this);
        }
    }
}
