package com.heesik.backend.domain.quiz.service;

import com.heesik.backend.domain.quiz.converter.QuizHistoryConverter;
import com.heesik.backend.domain.quiz.dto.response.QuizHistoryResDTO;
import com.heesik.backend.domain.quiz.entity.QuizHistory;
import com.heesik.backend.global.error.code.QuizErrorCode;
import com.heesik.backend.global.error.exception.QuizException;
import com.heesik.backend.domain.quiz.repository.QuizHistoryRepository;
import com.heesik.backend.global.dto.CursorResponseDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class QuizHistoryService {

    private final QuizHistoryRepository quizHistoryRepository;

    // 특정 퀴즈 풀이 이력 상세 조회
    public QuizHistoryResDTO getQuizHistory(Long userId, Long historyId) {
        QuizHistory history = quizHistoryRepository.findByIdWithAnswersAndQuestions(historyId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_HISTORY_NOT_FOUND));

        // 퀴즈 이력 소유자 권한 검증
        validateQuizHistoryOwner(history, userId);

        // 조회된 퀴즈 이력 DTO 변환
        return QuizHistoryConverter.toQuizHistoryResDTO(history);
    }

    // 퀴즈 풀이 이력 커서 기반 페이징 조회
    public CursorResponseDTO<QuizHistoryResDTO> getQuizHistoryList(Long userId, Long cursorId, int size) {
        // 다음 페이지 유무 판별을 위해 size + 1건 조회
        List<QuizHistory> histories = quizHistoryRepository.
                findHistoriesByUserIdAndCursorId(userId, cursorId, PageRequest.of(0, size + 1));
        
        // 다음 페이지 존재 시 추가 조회된 마지막 데이터 제거
        boolean hasNext = histories.size() > size;
        if (hasNext) {
            histories.remove(size);
        }

        List<QuizHistoryResDTO> content = histories.stream()
                .map(QuizHistoryConverter::toQuizHistoryResDTO)
                .collect(Collectors.toList());

        Long nextCursor = hasNext ? histories.get(size - 1).getId() : null;

        return CursorResponseDTO.of(content, nextCursor, hasNext);
    }

    // 퀴즈 풀이 이력 삭제
    @Transactional
    public void deleteQuizHistory(Long userId, Long historyId) {
        QuizHistory history = quizHistoryRepository.findByIdWithQuizAndUser(historyId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_HISTORY_NOT_FOUND));

        // 퀴즈 이력 소유자 권한 검증
        validateQuizHistoryOwner(history, userId);
        quizHistoryRepository.delete(history);
    }

    // 퀴즈 이력 소유자 권한 검증 공통 메서드
    private void validateQuizHistoryOwner(QuizHistory history, Long userId) {
        if (!history.getQuiz().getUser().getId().equals(userId)) {
            throw new QuizException(QuizErrorCode.QUIZ_HISTORY_ACCESS_DENIED);
        }
    }
}
