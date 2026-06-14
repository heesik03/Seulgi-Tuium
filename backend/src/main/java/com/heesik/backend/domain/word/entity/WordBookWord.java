package com.heesik.backend.domain.word.entity;

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
    name = "word_book_word",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_word_book_word", columnNames = {"word_book_id", "word_id"})
    },
    indexes = {
        @Index(name = "idx_wordbookword_book_added", columnList = "word_book_id, added_at DESC")
    }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class WordBookWord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 단어장에 단어가 추가된 일시
    @CreatedDate
    @Column(name = "added_at", nullable = false, updatable = false)
    private LocalDateTime addedAt;

    // 대상 단어장
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_book_id", nullable = false)
    private WordBook wordBook;

    // 대상 단어
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "word_id", nullable = false)
    private Word word;

    @Builder
    public WordBookWord(WordBook wordBook, Word word) {
        this.wordBook = wordBook;
        this.word = word;
        if (wordBook != null) {
            wordBook.addWordBookWord(this);
        }
    }
}
