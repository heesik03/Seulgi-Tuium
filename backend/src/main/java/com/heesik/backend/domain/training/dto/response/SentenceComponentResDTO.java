package com.heesik.backend.domain.training.dto.response;

import com.heesik.backend.domain.training.enums.SyntacticRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Builder
@Schema(description = "개별 문장 성분 단위 응답 DTO")
public record SentenceComponentResDTO(
        @Schema(description = "문장 성분 텍스트 (예: '나는 ')", example = "나는 ")
        String text,

        @Schema(description = "해당 성분 내 핵심 키워드 목록", example = "[\"나\"]")
        List<String> keywords,

        @Schema(description = "문장 성분 역할", example = "SUBJECT")
        SyntacticRole role,
        
        @Schema(description = "문장 성분 설명", example = "주어")
        String roleDescription
) {
}
