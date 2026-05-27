package com.heesik.backend.domain.analysis.enums;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Getter;

@Getter
@Schema(description = "번역 어투 설정 종류")
public enum TranslationTone {
    DEFAULT("""
            일반인이 읽었을 때 자연스럽고 이해하기 쉬운 현대 한국어 말투로 바꿔 주세요.
            짧고 쉬운 문장을 사용하고, 어려운 한자어 대신 일상 표현을 사용하세요.
            """),

    CHILD("""
            초등학교 저학년 어린이도 바로 이해할 수 있도록
            아주 쉽고 친절한 말투로 설명해 주세요.
            어려운 단어는 최대한 쉬운 표현으로 바꾸고,
            짧은 문장으로 나누어 설명해 주세요.
            "~해요", "~하는 거예요" 같은 부드러운 표현을 사용하세요.
            """),

    FRIENDLY("""
            친구나 부모님에게 설명하듯
            따뜻하고 자연스러운 대화체로 설명해 주세요.
            부담 없는 쉬운 표현을 사용하고,
            너무 딱딱한 표현은 피하세요.
            """),

    OFFICIAL("""
            공공기관 안내문이나 공식 보도자료처럼
            정중하고 명확한 문어체로 작성해 주세요.
            의미를 정확하게 전달하되,
            지나치게 어려운 표현은 피하세요.
            """);

    private final String instruction;

    TranslationTone(String instruction) {
        this.instruction = instruction;
    }
}
