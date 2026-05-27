package com.heesik.backend.domain.analysis.dto.response;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "우리말샘 사전 검색 결과 DTO")
public record UrimalsaemResDTO(
        @Schema(description = "검색된 전체 어휘 개수", example = "10")
        Integer total,

        @Schema(description = "검색 결과 시작 번호", example = "1")
        Integer start,

        @Schema(description = "제공된 어휘 개수", example = "10")
        Integer num,

        @Schema(description = "검색 결과 아이템 리스트")
        List<UrimalsaemItem> items
) { }
