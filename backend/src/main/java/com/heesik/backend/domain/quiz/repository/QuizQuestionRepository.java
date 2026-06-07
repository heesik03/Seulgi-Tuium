package com.heesik.backend.domain.quiz.repository;

import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizQuestionRepository extends JpaRepository<QuizQuestion, Long> {
}
