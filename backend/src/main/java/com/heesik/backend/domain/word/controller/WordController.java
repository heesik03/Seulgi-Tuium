package com.heesik.backend.domain.word.controller;


import com.heesik.backend.domain.word.dto.request.AddWordReqDTO;
import com.heesik.backend.domain.word.dto.response.FavoriteWordResDTO;
import com.heesik.backend.domain.word.service.WordService;
import com.heesik.backend.global.dto.CursorResponseDTO;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/word")
@RequiredArgsConstructor
@Tag(name = "단어 API", description = "단어 CRUD를 담당합니다. (JWT 필요)")
public class WordController {

    private final WordService wordService;

    @GetMapping
    @Operation(summary = "즐겨 찾기 단어 목록 조회", description = "즐겨 찾기한 단어 목록을 커서 기반으로 조회합니다.")
    public ResponseEntity<CursorResponseDTO<FavoriteWordResDTO>> getFavoriteWord(
            @RequestParam(required = false) Long lastId,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<FavoriteWordResDTO> response =
                wordService.getFavoriteWordByUserId(lastId, size, userDetails.id());
        boolean hasNext = response.size() > size; // 다음 데이터 존재 여부 확인

        List<FavoriteWordResDTO> content = hasNext ? response.subList(0, size) : response;

        // Service애서 더한 size에서 1 뺌
        Long nextCursor = content.isEmpty() ? null : content.get(content.size() - 1).favoriteWordId();

        return ResponseEntity.ok(CursorResponseDTO.of(content, nextCursor, hasNext));
    }


    @PostMapping
    public ResponseEntity<Long> addWordToFavorites(@jakarta.validation.Valid @RequestBody AddWordReqDTO request,
                                                   @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long favoriteWordId =
                wordService.saveWordAndWordFavorites(request, userDetails.id());

        return ResponseEntity.status(HttpStatus.CREATED).body(favoriteWordId);
    }

    @DeleteMapping("/{favoriteWordId}")
    @Operation(summary = "즐겨 찾기 단어 취소", description = "등록된 즐겨 찾기 단어를 취소(삭제)합니다.")
    public ResponseEntity<Void> deleteFavoriteWord(
            @PathVariable Long favoriteWordId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        wordService.deleteFavoriteWord(favoriteWordId, userDetails.id());
        return ResponseEntity.noContent().build();
    }


}
