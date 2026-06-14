package com.heesik.backend.global.util;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class WordUtilTest {

    @Test
    @DisplayName("null 입력 시 빈 문자열을 반환한다")
    void cleanWord_nullInput_returnsEmptyString() {
        assertEquals("", WordUtil.cleanWord(null));
    }

    @Test
    @DisplayName("특수 기호가 없는 일반 단어는 그대로 반환한다")
    void cleanWord_normalWord_returnsOriginal() {
        assertEquals("나무", WordUtil.cleanWord("나무"));
        assertEquals("하늘", WordUtil.cleanWord("하늘"));
    }

    @Test
    @DisplayName("띄어쓰기 허용 기호(^)가 제거되는지 검증한다")
    void cleanWord_caretSymbol_removesCaret() {
        assertEquals("우리나라", WordUtil.cleanWord("우리^나라"));
        assertEquals("산업혁명", WordUtil.cleanWord("산업^혁명"));
    }

    @Test
    @DisplayName("형태소 경계 표시 기호(-)가 제거되는지 검증한다")
    void cleanWord_hyphenSymbol_removesHyphen() {
        assertEquals("맨주먹", WordUtil.cleanWord("맨-주먹"));
        assertEquals("손가락", WordUtil.cleanWord("손-가락"));
        assertEquals("질", WordUtil.cleanWord("-질"));
        assertEquals("맨", WordUtil.cleanWord("맨-"));
    }

    @Test
    @DisplayName("기타 사전 관계 표시 기호들(≒, =, →)이 제거되는지 검증한다")
    void cleanWord_otherDictionarySymbols_removesSymbols() {
        assertEquals("한패", WordUtil.cleanWord("≒한패"));
        assertEquals("대등", WordUtil.cleanWord("=대등"));
        assertEquals("바로잡기", WordUtil.cleanWord("→바로잡기"));
    }

    @Test
    @DisplayName("단어 앞뒤의 공백이 trim 처리되는지 검증한다")
    void cleanWord_surroundingSpaces_trimsSpaces() {
        assertEquals("우리나라", WordUtil.cleanWord("   우리^나라   "));
        assertEquals("손가락", WordUtil.cleanWord("\t손-가락\n"));
    }

    @Test
    @DisplayName("여러 기호들이 복합적으로 포함된 경우 모두 제거하고 정제한다")
    void cleanWord_multipleSymbols_removesAll() {
        assertEquals("맨주먹과손가락", WordUtil.cleanWord("≒맨-주먹^과^손-가락→"));
    }
}
