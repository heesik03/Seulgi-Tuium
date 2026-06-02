package com.heesik.backend.domain.training.controller;

import com.heesik.backend.domain.training.dto.response.SentenceGroupResDTO;
import com.heesik.backend.domain.training.dto.request.SentenceTrainingReqDTO;
import com.heesik.backend.domain.training.service.SentenceTrainingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@Tag(name = "문장 훈련 API", description = "문장 훈련 관련 API")
@RestController
@RequestMapping("/api/training")
@RequiredArgsConstructor
public class SentenceTrainingController {

    private final SentenceTrainingService sentenceTrainingService;

    @Operation(summary = "문장 훈련 분할 처리", description = "입력된 텍스트를 선택한 난이도에 맞게 문장 수 기준으로 분할하고, 문장 성분을 분석하여 반환합니다.")
    @PostMapping("/chunk")
    public ResponseEntity<List<SentenceGroupResDTO>> processTraining(@Valid @RequestBody SentenceTrainingReqDTO req) {
        List<SentenceGroupResDTO> result = sentenceTrainingService.processTraining(req);
        return ResponseEntity.ok(result);
    }

}
