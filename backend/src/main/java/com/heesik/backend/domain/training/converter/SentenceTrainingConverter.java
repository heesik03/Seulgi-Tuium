package com.heesik.backend.domain.training.converter;

import com.fasterxml.jackson.databind.JsonNode;
import com.heesik.backend.domain.training.dto.response.SentenceComponentResDTO;
import com.heesik.backend.domain.training.dto.response.SentenceGroupResDTO;
import com.heesik.backend.domain.training.enums.SemanticRole;

import java.util.ArrayList;
import java.util.List;

public class SentenceTrainingConverter {

    private SentenceTrainingConverter() {}

    public static SentenceGroupResDTO toSentenceGroupResDTO(int groupIndex, String fullText, List<SentenceComponentResDTO> components) {
        return SentenceGroupResDTO.builder()
                .groupIndex(groupIndex)
                .fullText(fullText)
                .components(components)
                .build();
    }

    public static List<SentenceComponentResDTO> toSentenceComponentResDTOList(JsonNode jsonArrayNode) {
        List<SentenceComponentResDTO> result = new ArrayList<>();

        if (jsonArrayNode == null || !jsonArrayNode.isArray()) {
            return result;
        }

        for (JsonNode node : jsonArrayNode) {
            String text = node.path("text").asText();
            String roleStr = node.path("role").asText();

            SemanticRole role;
            try {
                role = SemanticRole.valueOf(roleStr);
            } catch (IllegalArgumentException e) {
                role = SemanticRole.OTHER; // 예외 발생 시 기본값
            }

            result.add(SentenceComponentResDTO.builder()
                    .text(text)
                    .keywords(new ArrayList<>()) // AI 기반 분석에서는 추출 생략
                    .role(role)
                    .roleDescription(role.getTitle())
                    .build());
        }

        return result;
    }

}
