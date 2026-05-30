package com.heesik.backend.domain.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.util.List;

@Builder
@Schema(description = "KOMORAN 형태소 분석 테스트 결과 DTO")
public record KomoranTestResDTO(
    @Schema(description = "추출된 명사 목록", example = "[\"아버지\", \"방\"]")
    List<String> nouns,
    
    @Schema(description = "전체 형태소 토큰 목록")
    List<KomoranTokenResDTO> tokens
) {}
