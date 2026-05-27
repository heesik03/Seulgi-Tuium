package com.heesik.backend.domain.word.entity;

import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(
        name = "word",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_word_target_code_sense_no",
                        columnNames = {"target_code", "sense_no"}
                )
        },
        indexes = {
                @Index(name = "idx_word_expression", columnList = "expression")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Word {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // 표제어 (단어 텍스트)
    @Column(nullable = false, length = 255)
    private String expression;

    // 우리말샘 대상 코드
    @Column(name = "target_code", nullable = false)
    private Long targetCode;

    // 의미 번호
    @Column(name = "sense_no", nullable = false)
    private Integer senseNo;

    // 단어의 뜻풀이
    @Column(nullable = false, length = 1000)
    private String meaning;

    // 품사 (명사, 동사 등)
    @Column(length = 50)
    private String pos;

    // 사전 상세 보기 링크
    @Column(length = 500)
    private String link;

    // 범주 (일반어, 방언, 옛말 등)
    @Column(length = 50)
    private String type;

    @Builder
    public Word(String expression, Long targetCode, Integer senseNo, String meaning, String pos, String link, String type) {
        this.expression = expression;
        this.targetCode = targetCode;
        this.senseNo = senseNo;
        this.meaning = meaning;
        this.pos = pos;
        this.link = link;
        this.type = type;
    }

    // 단어 정보 업데이트 메서드 (도메인 비즈니스 로직)
    public void updateWordInfo(String expression, Long targetCode, Integer senseNo, String meaning, String pos, String link, String type) {
        this.expression = expression;
        this.targetCode = targetCode;
        this.senseNo = senseNo;
        this.meaning = meaning;
        this.pos = pos;
        this.link = link;
        this.type = type;
    }
}
