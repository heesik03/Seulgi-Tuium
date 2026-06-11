package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.word.entity.Word;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface WordRepository extends JpaRepository<Word, Long> {
    Optional<Word> findByTargetCodeAndSenseNo(Long targetCode, Integer senseNo);

    @Query(value = "SELECT w.* FROM word w JOIN (SELECT id FROM word ORDER BY RAND() LIMIT 4) as r ON w.id = r.id", nativeQuery = true)
    List<Word> findRandomWordsLimit4();
}
