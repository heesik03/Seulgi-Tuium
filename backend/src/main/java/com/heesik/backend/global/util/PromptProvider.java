package com.heesik.backend.global.util;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Component
public class PromptProvider {

    // 클래스패스 리소스 경로에서 텍스트 프롬프트 파일을 읽어온다,
    public String loadPrompt(String resourcePath) {
        try {
            return new String(
                    new ClassPathResource(resourcePath).getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            ).strip();
        } catch (IOException e) {
            throw new IllegalArgumentException("프롬프트 리소스를 읽어오는 데 실패했습니다: " + resourcePath, e);
        }
    }

    // 프롬프트 템플릿 내의 플레이스홀더({key})를 지정된 매개변수 값으로 치환하여 프롬프트를 완성한다.
    public String buildPrompt(String template, Map<String, String> params) {
        String result = template;
        for (Map.Entry<String, String> entry : params.entrySet()) {
            result = result.replace("{" + entry.getKey() + "}", entry.getValue());
        }
        return result;
    }
}
