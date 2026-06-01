package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.WordBook;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface WordBookRepository extends JpaRepository<WordBook, Long> {

    @Query("select distinct wb from WordBook wb left join fetch wb.wordBookWords where wb.user.id = :userId order by wb.id desc")
    List<WordBook> findAllByUserIdOrderByIdDesc(@Param("userId") Long userId);
}
