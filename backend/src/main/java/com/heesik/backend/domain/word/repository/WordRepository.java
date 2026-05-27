package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByTargetCodeAndSenseNo(Long targetCode, Integer senseNo);
}
