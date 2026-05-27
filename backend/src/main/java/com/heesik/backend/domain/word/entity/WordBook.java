package com.heesik.backend.domain.word.entity;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "word_book")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class WordBook extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 단어장 제목
    @Column(nullable = false, length = 100)
    private String title;

    // 단어장 설명
    @Column(nullable = false, length = 200)
    private String description;

    // 단어장을 작성한 회원
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @OneToMany(mappedBy = "wordBook", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WordBookWord> wordBookWords = new ArrayList<>();

    @Builder
    public WordBook(String title, String description, User user) {
        this.title = title;
        this.description = description;
        this.user = user;
    }

    // 단어장 정보 수정 (도메인 비즈니스 로직)
    public void updateWordBook(String title, String description) {
        this.title = title;
        this.description = description;
    }
}
