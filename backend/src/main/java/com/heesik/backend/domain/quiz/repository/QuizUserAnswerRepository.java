package com.heesik.backend.domain.quiz.repository;

import com.heesik.backend.domain.quiz.entity.QuizUserAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

public interface QuizUserAnswerRepository extends JpaRepository<QuizUserAnswer, Long> {
}
