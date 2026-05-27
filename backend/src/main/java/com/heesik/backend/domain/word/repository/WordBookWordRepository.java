package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.WordBookWord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WordBookWordRepository extends JpaRepository<WordBookWord, Long> {

    /**
     * 특정 단어장의 단어 목록 첫 페이지를 조회합니다. (최신 추가일 순)
     */
    @Query("""
        SELECT wbw
        FROM WordBookWord wbw
        JOIN FETCH wbw.word
        WHERE wbw.wordBook.id = :wordBookId
        ORDER BY wbw.id DESC
    """)
    List<WordBookWord> findFirstPageByWordBookId(@Param("wordBookId") Long wordBookId, Pageable pageable);

    /**
     * 커서(마지막 조회 ID)를 기준으로 특정 단어장의 단어 목록 다음 페이지를 조회합니다. (최신 추가일 순)
     */
    @Query("""
        SELECT wbw
        FROM WordBookWord wbw
        JOIN FETCH wbw.word
        WHERE wbw.wordBook.id = :wordBookId
        AND wbw.id < :lastId
        ORDER BY wbw.id DESC
    """)
    List<WordBookWord> findByWordBookIdWithCursor(
            @Param("wordBookId") Long wordBookId,
            @Param("lastId") Long lastId,
            Pageable pageable
    );
}
