package com.heesik.backend.domain.training.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Builder
@Schema(description = "난이도별 묶인 문장 그룹 응답 DTO")
public record SentenceGroupResDTO(
        @Schema(description = "문장 그룹 인덱스", example = "1")
        int groupIndex,

        @Schema(description = "문장 그룹에 포함된 전체 텍스트", example = "나는 오늘 학교에 가서 공부를 했다.")
        String fullText,

        @Schema(description = "분리된 문장 성분 목록")
        List<SentenceComponentResDTO> components
) {
}
