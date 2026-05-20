package com.heesik.backend.domain.analysis.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(description = "우리말샘 사전 검색 요청 DTO")
public record UrimalsaemReqDTO(
        @Schema(description = "검색어", example = "나무")
        @NotBlank(message = "검색어는 필수 입력값입니다.")
        @Size(max = 100, message = "검색어는 100자 이하여야 합니다.")
        String q,

        @Schema(description = "검색 시작 번호 (1 ~ 1000)", example = "1", defaultValue = "1")
        @Min(value = 1, message = "시작 번호는 1 이상이어야 합니다.")
        @Max(value = 1000, message = "시작 번호는 1000 이하여야 합니다.")
        Integer start,

        @Schema(description = "결과 출력 건수 (10 ~ 100)", example = "10", defaultValue = "10")
        @Min(value = 10, message = "출력 건수는 최소 10건입니다.")
        @Max(value = 100, message = "출력 건수는 최대 100건입니다.")
        Integer num
) {
    public UrimalsaemReqDTO {
        if (start == null) start = 1;
        if (num == null) num = 10;
    }
}
