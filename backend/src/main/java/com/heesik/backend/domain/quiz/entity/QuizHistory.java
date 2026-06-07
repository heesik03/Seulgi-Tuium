package com.heesik.backend.domain.quiz.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Table(
        name = "quiz_history",
        indexes = {
                @Index(name = "idx_quiz_history_quiz_id", columnList = "quiz_id"),
                @Index(name = "idx_quiz_history_id_desc", columnList = "quiz_history_id DESC")
        }
)
public class QuizHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_history_id")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "quiz_id", nullable = false)
    private Quiz quiz;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "solved_at", nullable = false)
    private LocalDateTime solvedAt;

    @OneToMany(mappedBy = "quizHistory", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizUserAnswer> quizUserAnswers = new ArrayList<>();

    @Builder
    public QuizHistory(Quiz quiz, Integer score, LocalDateTime solvedAt) {
        this.quiz = quiz;
        this.score = score;
        this.solvedAt = solvedAt;
    }

    public void addQuizUserAnswer(QuizUserAnswer answer) {
        this.quizUserAnswers.add(answer);
    }
}
