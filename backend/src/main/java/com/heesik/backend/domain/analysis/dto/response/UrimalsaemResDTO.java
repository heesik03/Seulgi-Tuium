package com.heesik.backend.domain.analysis.dto.response;

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
) {
    @Schema(description = "우리말샘 사전 검색 단일 아이템 정보")
    public record UrimalsaemItem(
            @Schema(description = "표제어", example = "나무")
            String word,

            @Schema(description = "대상 코드", example = "368281")
            Long targetCode,

            @Schema(description = "의미 번호", example = "1")
            Integer senseNo,

            @Schema(description = "뜻풀이", example = "줄기나 가지가 목질로 된 여러해살이 식물.")
            String definition,

            @Schema(description = "품사", example = "명사")
            String pos,

            @Schema(description = "사전 상세 보기 링크", example = "https://opendict.korean.go.kr/dictionary/view?sense_no=368281")
            String link,

            @Schema(description = "범주 (일반어, 방언, 옛말 등)", example = "일반어")
            String type
    ) {}
}
