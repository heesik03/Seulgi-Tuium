package com.heesik.backend.domain.word.dto.response;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
@Schema(description = "즐겨찾기 목록 DTO")
public record FavoriteWordResDTO(
        @Schema(description = "즐겨찾기 단어 ID", example = "123")
        Long favoriteWordId,

        @Schema(description = "즐겨찾기 단어 등록일", example = "2026-05-27T15:30:00")
        LocalDateTime addedAt,

        @Schema(description = "단어 정보")
        UrimalsaemItem UrimalsaemItem
) {
}
