package com.heesik.backend.domain.analysis.converter;

import com.fasterxml.jackson.databind.JsonNode;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import com.heesik.backend.domain.analysis.error.UrimalsaemErrorCode;
import com.heesik.backend.domain.analysis.error.UrimalsaemException;
import lombok.AccessLevel;
import lombok.NoArgsConstructor;
import lombok.extern.slf4j.Slf4j;

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
                    items.add(parseItem(item));
                }
            } else if (itemNode.isObject()) {
                // 단일 아이템일 경우 array가 아닌 객체로 리턴되는 경우 방어 코드
                items.add(parseItem(itemNode));
            }

            return new UrimalsaemResDTO(total, start, num, items);
        } catch (UrimalsaemException e) {
            throw e;
        } catch (Exception e) {
            log.error("Failed to parse Urimalsaem API response", e);
            throw new UrimalsaemException(UrimalsaemErrorCode.JSON_PARSING_ERROR);
        }
    }


    // 개별 단어 아이템 노드를 파싱하여 UrimalsaemItem 레코드로 변환한다.
    private static UrimalsaemItem parseItem(JsonNode item) {
        String word = item.path("word").asText().trim();
        JsonNode senseNode = item.path("sense");
        
        if (senseNode.isObject()) {
            return buildItemFromSense(word, senseNode);
        } else if (senseNode.isArray() && !senseNode.isEmpty()) {
            return buildItemFromSense(word, senseNode.get(0));
        } else {
            // sense 노드가 없을 경우 (용례 검색 등) item 노드 레벨에서 정보 조회 시도
            Long targetCode = item.path("target_code").asLong(0L);
            Integer senseNo = item.path("sense_no").asInt(0);
            String definition = item.path("example").asText().trim(); // 용례일 경우 example 필드
            String link = item.path("link").asText().trim();
            return new UrimalsaemItem(word, targetCode, senseNo, definition, "", link, "");
        }
    }

    private static UrimalsaemItem buildItemFromSense(String word, JsonNode senseNode) {
        return new UrimalsaemItem(
                word,
                senseNode.path("target_code").asLong(),
                senseNode.path("sense_no").asInt(),
                senseNode.path("definition").asText().trim(),
                senseNode.path("pos").asText().trim(),
                senseNode.path("link").asText().trim(),
                senseNode.path("type").asText().trim()
        );
    }

    


}
