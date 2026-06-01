package com.heesik.backend.domain.word.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@Schema(description = "단어장 목록 조회 응답 DTO")
public record WordBookResDTO(
        @Schema(description = "단어장 ID", example = "1")
        Long wordBookId,

        @Schema(description = "단어장 제목", example = "나만의 단어장")
        String title,

        @Schema(description = "단어장 설명", example = "기말고사 대비 단어장")
        String description,

        @Schema(description = "단어장에 포함된 단어 수", example = "5")
        Integer wordCount,

        @Schema(description = "단어장 생성 일시", example = "2026-06-01T12:00:00")
        LocalDateTime createdAt
) {
}
