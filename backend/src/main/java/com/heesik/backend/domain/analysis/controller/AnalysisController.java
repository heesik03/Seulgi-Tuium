package com.heesik.backend.domain.analysis.controller;

import com.heesik.backend.domain.analysis.dto.request.AnalysisTranslateReqDTO;
import com.heesik.backend.domain.analysis.dto.request.UrimalsaemReqDTO;
import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.service.AnalysisService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/analysis")
@RequiredArgsConstructor
@Tag(
        name = "말 번역기 API",
        description = "어려운 말, 쉬운 말 번역 기능 관련 Gemini API, 우리말샘 API 호출 등을 담당합니다. (로그인 필요)"
)
public class AnalysisController {

    private final AnalysisService analysisService;

    @GetMapping("/search")
    @Operation(
            summary = "우리말샘 사전 검색 API 호출",
            description = "우리말샘 OpenAPI를 호출하여 특정 키워드에 대해 단어의 의미와 품사 등을 포함한 검색 결과를 반환합니다."
    )
    public ResponseEntity<UrimalsaemResDTO> searchUrimalsaem(
            @Valid @ModelAttribute UrimalsaemReqDTO request
    ) {
        UrimalsaemResDTO result = analysisService.searchUrimalsaem(request);
        return ResponseEntity.ok(result);
    }

    @PostMapping("/translate")
    @Operation(
            summary = "어려운 말을 쉬운 말로 번역 및 어려운 단어 추출",
            description = "Gemini API를 호출하여 어려운 글을 알기 쉬운 말로 변환하고, " +
                    "AI가 문맥을 바탕으로 선정한 어려운 단어 목록과 KOMORAN 형태소 분석기가 원문에서 추출한 명사 키워드 목록을 함께 반환합니다."
    )
    public ResponseEntity<AnalysisTranslateResDTO> translateAndSearch(
            @Valid @RequestBody AnalysisTranslateReqDTO request
    ) {
        AnalysisTranslateResDTO result = analysisService.translateAndSearch(request);
        return ResponseEntity.ok(result);
    }

}
