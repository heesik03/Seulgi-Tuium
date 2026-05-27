package com.heesik.backend.domain.word.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "빈 단어장 생성 요청 DTO")
public record CreateWordBookReqDTO(
    @NotBlank(message = "단어장 제목은 필수입니다.")
    @Schema(description = "단어장 제목", example = "나만의 단어장")
    String title,

    @NotBlank(message = "단어장 설명은 필수입니다.")
    @Schema(description = "단어장 설명", example = "내가 자주 잊어버리는 단어들")
    String description
) {}
