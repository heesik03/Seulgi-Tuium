package com.heesik.backend.domain.training.converter;

import com.heesik.backend.domain.training.dto.response.SentenceComponentResDTO;
import com.heesik.backend.domain.training.dto.response.SentenceGroupResDTO;

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
}
