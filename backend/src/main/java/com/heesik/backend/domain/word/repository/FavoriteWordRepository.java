package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.FavoriteWord;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface FavoriteWordRepository extends JpaRepository<FavoriteWord, Long> {

    @Query("""
        SELECT fw
        FROM FavoriteWord fw
        JOIN FETCH fw.word
        WHERE fw.user.id = :userId
        ORDER BY fw.id DESC
    """)
    List<FavoriteWord> findFirstPageByUserId(@Param("userId") Long userId, Pageable pageable);


    @Query("""
        SELECT fw
        FROM FavoriteWord fw
        JOIN FETCH fw.word
        WHERE fw.user.id = :userId
        AND fw.id < :lastId
        ORDER BY fw.id DESC
    """)
    List<FavoriteWord> findByUserIdWithCursor(
            @Param("userId") Long userId,
            @Param("lastId") Long lastId,
            Pageable pageable
    );


}
