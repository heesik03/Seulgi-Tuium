package com.heesik.backend.domain.analysis.dto.response;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "어려운 말 번역 및 단어 추출 결과 응답 DTO")
public record AnalysisTranslateResDTO(
        @Schema(description = "쉽게 이해할 수 있도록 변환된 현대어 텍스트", example = "오늘 피고인은 법정에 나오지 않았고, 변호사는 재판 날짜를 바꾸어 달라고 요청했습니다.")
        String convertedText,

        @Schema(description = "본문에서 추출된 어려운 단어들의 상세 사전 정의 리스트")
        List<UrimalsaemItem> words
) {
}
