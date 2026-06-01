package com.heesik.backend.domain.word.controller;

import com.heesik.backend.domain.word.dto.request.CreateWordBookReqDTO;
import com.heesik.backend.domain.word.dto.request.CreateWordBookWithWordsReqDTO;
import com.heesik.backend.domain.word.dto.request.UpdateWordBookReqDTO;
import com.heesik.backend.domain.word.dto.response.WordBookResDTO;
import com.heesik.backend.domain.word.dto.response.WordBookWordResDTO;
import com.heesik.backend.domain.word.service.WordBookService;
import com.heesik.backend.global.dto.CursorResponse;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wordbook")
@RequiredArgsConstructor
@Tag(name = "단어장 API", description = "단어장 생성 및 관리를 담당합니다. (JWT 필요)")
public class WordBookController {

    private final WordBookService wordBookService;

    @GetMapping
    @Operation(summary = "단어장 목록 조회", description = "로그인한 사용자의 전체 단어장 목록을 조회합니다.")
    public ResponseEntity<List<WordBookResDTO>> getWordBooks(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<WordBookResDTO> response = wordBookService.getWordBooks(userDetails.id());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{wordBookId}/words")
    @Operation(summary = "단어장 내 단어 목록 커서 페이징 조회", description = "단어장에 포함된 단어들을 커서 기반으로 조회합니다.")
    public ResponseEntity<CursorResponse<WordBookWordResDTO>> getWordBookWords(
            @PathVariable Long wordBookId,
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<WordBookWordResDTO> response =
                wordBookService.getWordBookWordsWithCursor(wordBookId, lastId, size, userDetails.id());

        boolean hasNext = response.size() > size;
        List<WordBookWordResDTO> content = hasNext ? response.subList(0, size) : response;
        Long nextCursor = content.isEmpty() ? null : content.get(content.size() - 1).wordBookWordId();

        return ResponseEntity.ok(CursorResponse.of(content, nextCursor, hasNext));
    }

    @PostMapping("/empty")
    @Operation(summary = "빈 단어장 생성", description = "단어 없이 사용자가 지정한 제목과 설명으로 빈 단어장을 생성합니다.")
    public ResponseEntity<Long> createEmptyWordBook(
            @RequestBody @Valid CreateWordBookReqDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long wordBookId = wordBookService.saveEmptyWordBook(request, userDetails.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(wordBookId);
    }

    @PostMapping("/with-words")
    @Operation(summary = "단어를 포함한 단어장 생성", description = "여러 단어를 포함하는 단어장을 생성합니다. 제목과 설명은 날짜 기반으로 자동 생성됩니다.")
    public ResponseEntity<Long> createWordBookWithWords(
            @RequestBody @Valid CreateWordBookWithWordsReqDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        Long wordBookId = wordBookService.saveWordBookWithWords(request, userDetails.id());
        return ResponseEntity.status(HttpStatus.CREATED).body(wordBookId);
    }

    @PatchMapping("/{wordBookId}")
    @Operation(summary = "단어장 제목 및 설명 수정", description = "지정한 단어장의 제목과 설명을 수정합니다.")
    public ResponseEntity<Void> updateWordBook(
            @PathVariable Long wordBookId,
            @RequestBody @Valid UpdateWordBookReqDTO request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        wordBookService.updateWordBook(wordBookId, request, userDetails.id());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{wordBookId}")
    @Operation(summary = "단어장 삭제", description = "지정한 단어장을 삭제합니다. 단어장 매핑 정보들도 연쇄 삭제됩니다.")
    public ResponseEntity<Void> deleteWordBook(
            @PathVariable Long wordBookId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        wordBookService.deleteWordBook(wordBookId, userDetails.id());
        return ResponseEntity.noContent().build();
    }

}
