package com.heesik.backend.global.util;

import lombok.AccessLevel;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;


@NoArgsConstructor(access = AccessLevel.PRIVATE)
public final class GeminiRequestBuilder {

    /**
     * Gemini Structured Output 요청 바디를 생성함.
     *
     * systemInstruction : Gemini에게 부여할 역할 및 행동 지침 (System Instruction)
     * userPrompt : 실제 사용자 요청 프롬프트 (User Prompt)
     * responseSchema : Gemini가 반환해야 할 JSON 스키마 정의 Map
     */
    public static Map<String, Object> buildStructuredOutputBody(
            String systemInstruction,
            String userPrompt,
            Map<String, Object> responseSchema
    ) {
        return Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", userPrompt)
                        ))
                ),
                "systemInstruction", Map.of(
                        "parts", List.of(
                                Map.of("text", systemInstruction)
                        )
                ),
                "generationConfig", Map.of(
                        "responseMimeType", "application/json",
                        "responseSchema", responseSchema
                )
        );
    }
}
