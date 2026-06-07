package com.heesik.backend.domain.quiz.entity;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
@Table(
        name = "quiz",
        indexes = {
                @Index(name = "idx_quiz_user_id", columnList = "user_id"),
                @Index(name = "idx_quiz_id_desc", columnList = "quiz_id DESC")
        }
)
public class Quiz extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "quiz_id")
    private Long id;

    @Column(name = "title", nullable = false, length = 120)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizQuestion> quizQuestions = new ArrayList<>();

    @OneToMany(mappedBy = "quiz", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<QuizHistory> quizHistories = new ArrayList<>();

    @Builder
    public Quiz(String title, User user) {
        this.title = title;
        this.user = user;
    }

    public void addQuizQuestion(QuizQuestion question) {
        this.quizQuestions.add(question);
    }

    public void updateTitle(String title) {
        this.title = title;
    }
}
