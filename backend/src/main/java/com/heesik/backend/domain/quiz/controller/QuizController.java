package com.heesik.backend.domain.quiz.controller;

import com.heesik.backend.domain.quiz.dto.request.QuizHistoryReqDTO;
import com.heesik.backend.domain.quiz.dto.response.QuizHistoryResDTO;
import com.heesik.backend.domain.quiz.dto.request.QuizReqDTO;
import com.heesik.backend.domain.quiz.dto.response.QuizResDTO;
import com.heesik.backend.domain.quiz.dto.request.QuizUpdateReqDTO;
import com.heesik.backend.domain.quiz.service.QuizService;
import com.heesik.backend.global.dto.CursorResponseDTO;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@Tag(name = "퀴즈 API", description = "단어 기반 퀴즈 생성, 이력 관리 및 풀이 API")
@RestController
@RequiredArgsConstructor
@RequestMapping("/api/quizzes")
public class QuizController {

    private final QuizService quizService;

    @Operation(summary = "퀴즈 생성", description = "4~10개의 단어를 입력받아 Gemini로 4지선다 문제를 생성합니다.")
    @PostMapping
    public ResponseEntity<QuizResDTO> createQuiz(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                 @Valid @RequestBody QuizReqDTO reqDTO) {
        QuizResDTO result = quizService.createQuiz(userDetails.id(), reqDTO);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "퀴즈 단건 상세 조회", description = "생성된 퀴즈와 문제 목록을 단건 조회합니다.")
    @GetMapping("/{quizId}")
    public ResponseEntity<QuizResDTO> getQuiz(@AuthenticationPrincipal CustomUserDetails userDetails,
                                              @PathVariable Long quizId) {
        QuizResDTO result = quizService.getQuiz(userDetails.id(), quizId);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "내 퀴즈 목록 페이징 조회", description = "사용자가 생성한 퀴즈 목록을 커서 기반 페이징 처리하여 조회합니다.")
    @GetMapping
    public ResponseEntity<CursorResponseDTO<QuizResDTO>> getQuizList(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                                     @RequestParam(required = false) Long cursorId,
                                                                     @RequestParam(defaultValue = "10") int size) {
        CursorResponseDTO<QuizResDTO> result = quizService.getQuizList(userDetails.id(), cursorId, size);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "퀴즈 삭제", description = "사용자가 생성한 퀴즈를 삭제합니다.")
    @DeleteMapping("/{quizId}")
    public ResponseEntity<Void> deleteQuiz(@AuthenticationPrincipal CustomUserDetails userDetails,
                                           @PathVariable Long quizId) {
        quizService.deleteQuiz(userDetails.id(), quizId);
        return ResponseEntity.ok().build();
    }

    @Operation(summary = "퀴즈 제목 수정", description = "사용자가 생성한 퀴즈의 제목을 수정합니다.")
    @PatchMapping("/{quizId}")
    public ResponseEntity<QuizResDTO> updateQuizTitle(@AuthenticationPrincipal CustomUserDetails userDetails,
                                                      @PathVariable Long quizId,
                                                      @Valid @RequestBody QuizUpdateReqDTO reqDTO) {
        QuizResDTO result = quizService.updateQuizTitle(userDetails.id(), quizId, reqDTO);
        return ResponseEntity.ok(result);
    }

    @Operation(summary = "퀴즈 답안 제출 및 채점", description = "특정 퀴즈에 대한 사용자의 풀이 결과(답안들)를 제출받아 채점 후 이력을 저장합니다.")
    @PostMapping("/{quizId}/submit")
    public ResponseEntity<QuizHistoryResDTO> submitQuiz(@PathVariable Long quizId,
                                                        @Valid @RequestBody QuizHistoryReqDTO reqDTO) {
        QuizHistoryResDTO result = quizService.submitQuiz(quizId, reqDTO);
        return ResponseEntity.ok(result);
    }

}
