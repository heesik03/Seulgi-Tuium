package com.heesik.backend.domain.word.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "단어장 수정 요청 DTO")
public record UpdateWordBookReqDTO(
        @NotBlank(message = "단어장 제목은 필수입니다.")
        @Schema(description = "수정할 단어장 제목", example = "수정된 나만의 단어장")
        String title,

        @NotBlank(message = "단어장 설명은 필수입니다.")
        @Schema(description = "수정할 단어장 설명", example = "단어장 설명을 수정합니다.")
        String description
) {}
