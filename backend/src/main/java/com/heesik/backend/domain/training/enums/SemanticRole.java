package com.heesik.backend.domain.training.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SemanticRole {
    SUBJECT("주어", "행동 또는 상태의 주체 (누가, 무엇이)"),
    OBJECT("목적어", "행동의 대상 (무엇을, 누구를)"),
    PREDICATE("서술어", "행동 또는 상태 (동사, 형용사 중심)"),
    CAUSE("원인", "이유, 근거, 배경, 조건 (~해서, ~때문에, ~하여, ~하자 등)"),
    RESULT("결과", "원인으로 인해 발생한 결과 (~되었다, ~나타났다, ~발생했다 등)"),
    OTHER("기타", "시간, 장소, 수식어, 접속, 인용 등 위 5개에 속하지 않는 모든 요소");

    private final String title;
    private final String description;
}
