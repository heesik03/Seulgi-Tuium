package com.heesik.backend.global.dto;

import java.util.List;

public record CursorResponseDTO<T>(
        List<T> content,
        Long nextCursor,
        boolean hasNext
) {
    public static <T> CursorResponseDTO<T> of(List<T> content, Long nextCursor, boolean hasNext) {
        return new CursorResponseDTO<>(content, nextCursor, hasNext);
    }
}
