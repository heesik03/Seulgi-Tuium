package com.heesik.backend.domain.analysis.dto.request;

import com.heesik.backend.domain.analysis.enums.TranslationTone;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(description = "어려운 말 번역 및 단어 추출 요청 DTO")
public record AnalysisTranslateReqDTO(
        @Schema(description = "번역할 어려운 문장/문단 (최대 1000자)", example = "금일 피고인은 법정에 출석하지 아니하였으며, 변호인은 기일을 변경해줄 것을 신청하였습니다.")
        @NotBlank(message = "번역할 원문은 필수 입력값입니다.")
        @Size(max = 1000, message = "번역할 원문은 최대 1000자 이하여야 합니다.")
        String text,

        @Schema(description = "번역 어투 설정 (DEFAULT: 기본, CHILD: 어린이용, FRIENDLY: 친근한 말투, OFFICIAL: 공식 설명)", example = "DEFAULT")
        @NotNull(message = "번역 어투 설정은 필수 입력값입니다.")
        TranslationTone tone
) {
}
