package com.heesik.backend.domain.training.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
@Schema(description = "문장 성분 (품사 태깅 기반)")
public enum SyntacticRole {
    SUBJECT("주어"),
    OBJECT("목적어"),
    PREDICATE("서술어"),
    COMPLEMENT("보어"),
    ADVERBIAL("부사어"),
    MODIFIER("관형어"),
    INDEPENDENT("독립어"),
    CONJUNCTION("접속어"),
    UNKNOWN("기타");

    private final String description;
}
