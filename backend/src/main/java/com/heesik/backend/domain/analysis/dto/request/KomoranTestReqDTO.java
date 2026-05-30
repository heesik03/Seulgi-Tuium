package com.heesik.backend.domain.analysis.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "KOMORAN 형태소 분석 테스트 요청 DTO")
public record KomoranTestReqDTO(
    @NotBlank(message = "분석할 텍스트는 필수입니다.")
    @Schema(description = "분석 대상 문장", example = "아버지가 방에 들어가신다.")
    String text
) {}
