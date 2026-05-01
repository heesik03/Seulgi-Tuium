package com.heesik.backend.global.error;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.Builder;

import java.time.LocalDateTime;

// 에러 반환 DTO
public record ErrorResDTO(
        String errorCode,
        String message,

        @JsonFormat(
                shape = JsonFormat.Shape.STRING,
                pattern = "yyyy-MM-dd'T'HH:mm:ss",
                timezone = "Asia/Seoul"
        )
        LocalDateTime timestamp
) {
    @Builder
    public ErrorResDTO(String errorCode, String message) {
        this(errorCode, message, LocalDateTime.now());
    }
}