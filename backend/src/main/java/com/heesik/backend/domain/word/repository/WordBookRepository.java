package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.WordBook;
import org.springframework.data.jpa.repository.JpaRepository;

public interface WordBookRepository extends JpaRepository<WordBook, Long> {
}
