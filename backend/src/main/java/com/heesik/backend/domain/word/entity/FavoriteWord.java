package com.heesik.backend.domain.word.entity;

import com.heesik.backend.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "favorite_word",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_favorite_word_user_word", columnNames = {"user_id", "word_id"})
    },
    indexes = {
        @Index(name = "idx_favorite_word_user_id", columnList = "user_id, id DESC")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class FavoriteWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 즐겨찾기에 추가된 일시
    @CreatedDate
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    // 즐겨찾기를 등록한 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 즐겨찾기 대상 단어
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Builder
    public FavoriteWord(User user, Word word) {
        this.user = user;
        this.word = word;
    }
}
