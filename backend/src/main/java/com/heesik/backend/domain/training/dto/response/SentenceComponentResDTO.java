package com.heesik.backend.domain.training.dto.response;

import com.heesik.backend.domain.training.enums.SemanticRole;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.util.List;

@Builder
@Schema(description = "개별 문장 성분 단위 응답 DTO")
public record SentenceComponentResDTO(
        @Schema(description = "분할된 의미 단위 텍스트 (예: '기동대를 투입해 ')", example = "기동대를 투입해 ")
        String text,

        @Schema(description = "해당 의미 단위 내 핵심 키워드 목록 (AI 분석 시 빈 배열 반환)", example = "[]")
        List<String> keywords,

        @Schema(description = "문장 성분 의미 역할 (SUBJECT, OBJECT, PREDICATE, CAUSE, RESULT, OTHER)", example = "CAUSE")
        SemanticRole role,
        
        @Schema(description = "문장 성분 의미 역할에 대한 한글 설명", example = "원인")
        String roleDescription
) {
}
