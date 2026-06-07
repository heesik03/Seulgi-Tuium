package com.heesik.backend.domain.quiz.repository;

import com.heesik.backend.domain.quiz.entity.QuizHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface QuizHistoryRepository extends JpaRepository<QuizHistory, Long> {

    // 특정 퀴즈 기록, 내 답변, 원래 문제, 퀴즈, 유저까지 전체 조회
    @Query("""
            SELECT qh
            FROM QuizHistory qh
            JOIN FETCH qh.quiz q
            JOIN FETCH q.user
            JOIN FETCH qh.quizUserAnswers qua
            JOIN FETCH qua.quizQuestion
            WHERE qh.id = :historyId
            """)
    Optional<QuizHistory> findByIdWithAnswersAndQuestions(@Param("historyId") Long historyId);

    // 퀴즈 이력 + 퀴즈 + 유저 Fetch Join 조회 (소유자 검증용 경량 쿼리)
    @Query("""
            SELECT qh
            FROM QuizHistory qh
            JOIN FETCH qh.quiz q
            JOIN FETCH q.user
            WHERE qh.id = :historyId
            """)
    Optional<QuizHistory> findByIdWithQuizAndUser(@Param("historyId") Long historyId);

    // 특정 유저의 퀴즈 기록 최신순 커서 기반 페이징 조회
    @Query("""
            SELECT qh
            FROM QuizHistory qh
            JOIN FETCH qh.quiz q
            WHERE qh.quiz.id IN (SELECT sq.id FROM Quiz sq WHERE sq.user.id = :userId)
              AND (:cursorId IS NULL OR qh.id < :cursorId)
            ORDER BY qh.id DESC
            """)
    List<QuizHistory> findHistoriesByUserIdAndCursorId(@Param("userId") Long userId, @Param("cursorId") Long cursorId, Pageable pageable);
}
