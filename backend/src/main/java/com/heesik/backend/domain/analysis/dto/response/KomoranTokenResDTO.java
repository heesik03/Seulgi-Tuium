package com.heesik.backend.domain.analysis.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

@Builder
@Schema(description = "KOMORAN 형태소 분석 결과 토큰 DTO")
public record KomoranTokenResDTO(
    @Schema(description = "형태소", example = "아버지")
    String morph,
    
    @Schema(description = "품사 태그", example = "NNG")
    String pos,
    
    @Schema(description = "시작 인덱스", example = "0")
    Integer beginIndex,
    
    @Schema(description = "끝 인덱스", example = "3")
    Integer endIndex
) {}
