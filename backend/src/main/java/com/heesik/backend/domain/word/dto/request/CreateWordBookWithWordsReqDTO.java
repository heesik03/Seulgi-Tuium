package com.heesik.backend.domain.word.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;
import java.util.List;

@Schema(description = "단어 리스트를 포함한 단어장 생성 요청 DTO")
public record CreateWordBookWithWordsReqDTO(
    @NotEmpty(message = "단어 목록은 비어있을 수 없습니다.")
    @Schema(description = "추가할 단어 목록")
    List<AddWordReqDTO> words
) {}
