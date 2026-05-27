package com.heesik.backend.domain.word.dto.response;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;
import java.time.LocalDateTime;

@Builder
@Schema(description = "단어장 내 단어 목록 조회 응답 DTO")
public record WordBookWordResDTO(
        @Schema(description = "단어장 단어 매핑 ID (커서로 활용)", example = "123")
        Long wordBookWordId,

        @Schema(description = "단어장에 추가된 날짜", example = "2026-05-27T15:30:00")
        LocalDateTime addedAt,

        @Schema(description = "단어 정보")
        UrimalsaemItem UrimalsaemItem
) {}
