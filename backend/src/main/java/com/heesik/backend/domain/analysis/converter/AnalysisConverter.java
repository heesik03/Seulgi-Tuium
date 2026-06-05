package com.heesik.backend.domain.analysis.converter;

import com.fasterxml.jackson.databind.JsonNode;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import com.heesik.backend.domain.analysis.error.UrimalsaemErrorCode;
import com.heesik.backend.domain.analysis.error.UrimalsaemException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;

import java.util.ArrayList;
import java.util.List;

@Slf4j
public final class AnalysisConverter {

    public AnalysisConverter() {}

    // 우리말샘 JSON 응답(JsonNode)을 AnalysisUrimalsaemResDTO로 변환
    public static UrimalsaemResDTO toUrimalsaemResDTO(JsonNode rootNode) {
        try {
            JsonNode channelNode = rootNode.path("channel");
            if (channelNode.isMissingNode()) {
                throw new UrimalsaemException(UrimalsaemErrorCode.JSON_PARSING_ERROR);
            }

            Integer total = channelNode.path("total").asInt();
            Integer start = channelNode.path("start").asInt();
            Integer num = channelNode.path("num").asInt();

            List<UrimalsaemItem> items = new ArrayList<>();
            JsonNode itemNode = channelNode.path("item");

            if (itemNode.isArray()) {
                for (JsonNode item : itemNode) {
                    items.addAll(parseItems(item));
                }
            } else if (itemNode.isObject()) {
                // 단일 아이템일 경우 array가 아닌 객체로 리턴되는 경우 방어 코드
                items.addAll(parseItems(itemNode));
            }

            return UrimalsaemResDTO.builder()
                    .total(total)
                    .start(start)
                    .num(num)
                    .items(items)
                    .build();
        } catch (UrimalsaemException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Urimalsaem API response", e);
            throw new UrimalsaemException(UrimalsaemErrorCode.JSON_PARSING_ERROR);
        }
    }


    // 개별 단어 아이템 노드를 파싱하여 UrimalsaemItem 리스트로 변환한다.
    private static List<UrimalsaemItem> parseItems(JsonNode item) {
        String word = item.path("word").asText().trim();
        JsonNode senseNode = item.path("sense");
        
        List<UrimalsaemItem> result = new ArrayList<>();

        if (senseNode.isObject()) {
            result.add(buildItemFromSense(word, senseNode));
        } else if (senseNode.isArray() && !senseNode.isEmpty()) {
            for (JsonNode sense : senseNode) {
                result.add(buildItemFromSense(word, sense));
            }
        } else {
            // sense 노드가 없을 경우 (용례 검색 등) item 노드 레벨에서 정보 조회 시도
            Long targetCode = item.path("target_code").asLong(0L);
            Integer senseNo = item.path("sense_no").asInt(0);
            String definition = item.path("example").asText().trim(); // 용례일 경우 example 필드
            String link = item.path("link").asText().trim();
            result.add(UrimalsaemItem.builder()
                    .word(word)
                    .targetCode(targetCode)
                    .senseNo(senseNo)
                    .definition(definition)
                    .pos("")
                    .link(link)
                    .type("")
                    .build());
        }
        
        return result;
    }

    private static UrimalsaemItem buildItemFromSense(String word, JsonNode senseNode) {
        return UrimalsaemItem.builder()
                .word(word)
                .targetCode(senseNode.path("target_code").asLong())
                .senseNo(senseNode.path("sense_no").asInt())
                .definition(senseNode.path("definition").asText().trim())
                .pos(senseNode.path("pos").asText().trim())
                .link(senseNode.path("link").asText().trim())
                .type(senseNode.path("type").asText().trim())
                .build();
    }

    // Gemini API의 응답 문자열을 파싱하여 AI 선정 어려운 단어와 변환된 텍스트를 분리하고, KOMORAN 키워드와 함께 DTO로 묶어 반환한다.
    public static AnalysisTranslateResDTO toAnalysisTranslateResDTO(String geminiText, List<String> komoranKeywords) {
        String convertedText = geminiText;
        List<String> aiDifficultWords = new ArrayList<>();

        int difficultWordsIndex = geminiText.indexOf("[어려운 단어]");
        if (difficultWordsIndex != -1) {
            String easyText = geminiText.substring(0, difficultWordsIndex).replace("[쉬운말]", "").trim();
            String difficultWordsSection = geminiText.substring(difficultWordsIndex + "[어려운 단어]".length()).trim();

            String[] lines = difficultWordsSection.split("\n");
            for (String line : lines) {
                line = line.trim();
                if (line.startsWith("-")) {
                    line = line.substring(1).trim();
                    String[] parts = line.split(":", 2);
                    if (parts.length > 0 && !parts[0].trim().isEmpty()) {
                        aiDifficultWords.add(parts[0].trim());
                    }
                }
            }
            convertedText = easyText;
        } else {
            convertedText = convertedText.replace("[쉬운말]", "").trim();
        }

        return new AnalysisTranslateResDTO(convertedText, aiDifficultWords, komoranKeywords);
    }

}
