package com.heesik.backend.domain.quiz.controller;

import com.heesik.backend.domain.quiz.dto.response.QuizHistoryResDTO;
import com.heesik.backend.domain.quiz.service.QuizHistoryService;
import com.heesik.backend.global.dto.CursorResponseDTO;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "퀴즈 풀이 이력 API", description = "사용자의 퀴즈 풀이 이력 조회 및 삭제 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quiz-histories")
public class QuizHistoryController {

    private final QuizHistoryService quizHistoryService;

    @Operation(summary = "퀴즈 이력 단건 상세 조회", description = "특정 풀이 이력의 점수 및 상세 답안 내역을 조회합니다.")
    @GetMapping("/{historyId}")
    public ResponseEntity<QuizHistoryResDTO> getQuizHistory(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                            @PathVariable Long historyId) {
        QuizHistoryResDTO result = quizHistoryService.getQuizHistory(userDetails.id(), historyId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "전체 퀴즈 풀이 이력 페이징 조회", description = "사용자의 전체 퀴즈 풀이 이력 목록을 커서 기반 페이징 처리하여 조회합니다.")
    @GetMapping
    public ResponseEntity<CursorResponseDTO<QuizHistoryResDTO>> getQuizHistoryList(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                                   @RequestParam(required = false) Long cursorId,
                                                                                   @RequestParam(defaultValue = "10") int size) {
        CursorResponseDTO<QuizHistoryResDTO> result = quizHistoryService.getQuizHistoryList(userDetails.id(), cursorId, size);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "퀴즈 풀이 이력 삭제", description = "사용자의 퀴즈 풀이 이력을 삭제합니다.")
    @DeleteMapping("/{historyId}")
    public ResponseEntity<Void> deleteQuizHistory(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                  @PathVariable Long historyId) {
        quizHistoryService.deleteQuizHistory(userDetails.id(), historyId);
        return ResponseEntity.ok().build();
    }
}
