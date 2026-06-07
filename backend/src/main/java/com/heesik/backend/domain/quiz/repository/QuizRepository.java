package com.heesik.backend.domain.quiz.repository;

import com.heesik.backend.domain.quiz.entity.Quiz;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizRepository extends JpaRepository<Quiz, Long> {

    // 퀴즈 아이디로 문제 목록까지 한 번에 조회 (N+1 방어)
    @Query("""
            SELECT q
            FROM Quiz q
            JOIN FETCH q.quizQuestions
            WHERE q.id = :quizId
            """)
    Optional<Quiz> findByIdWithQuestions(@Param("quizId") Long quizId);

    // 특정 유저가 만든 퀴즈 목록 최신순 페이징 조회
    @Query("""
            SELECT q
            FROM Quiz q
            WHERE q.user.id = :userId
              AND (:cursorId IS NULL OR q.id < :cursorId)
            ORDER BY q.id DESC
            """)
    List<Quiz> findQuizzesByUserIdAndCursorId(@Param("userId") Long userId, @Param("cursorId") Long cursorId, Pageable pageable);
}
