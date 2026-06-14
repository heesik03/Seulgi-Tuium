package com.heesik.backend.global.util;

public class WordUtil {

    private WordUtil() {}

    public static String cleanWord(String word) {
        if (word == null) {
            return "";
        }
        // ^, -, ≒, =, → 기호를 제거하고 trim 수행
        return word.replaceAll("[\\^\\-≒=→]", "").trim();
    }
}
