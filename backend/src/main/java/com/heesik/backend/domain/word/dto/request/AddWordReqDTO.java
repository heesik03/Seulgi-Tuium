package com.heesik.backend.domain.word.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(description = "즐겨찾기 단어 등록 DTO")
public record AddWordReqDTO (
    @NotBlank(message = "표제어는 필수입니다.")
    @Schema(description = "표제어", example = "나무")
    String word,

    @NotNull(message = "대상 코드는 필수입니다.")
    @Schema(description = "대상 코드", example = "368281")
    Long targetCode,

    @NotNull(message = "의미 번호는 필수입니다.")
    @Schema(description = "의미 번호", example = "1")
    Integer senseNo,

    @NotBlank(message = "뜻풀이는 필수입니다.")
    @Schema(description = "뜻풀이", example = "줄기나 가지가 목질로 된 여러해살이 식물.")
    String definition,

    @Schema(description = "품사", example = "명사")
    String pos,

    @Schema(description = "사전 상세 보기 링크", example = "https://opendict.korean.go.kr/dictionary/view?sense_no=368281")
    String link,

    @Schema(description = "범주 (일반어, 방언, 옛말 등)", example = "일반어")
    String type
) {}
