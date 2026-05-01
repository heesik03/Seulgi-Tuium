package com.heesik.backend.domain.user.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "엑세스 토큰과 토큰 타입 반환 정보를 담은 DTO")
public record TokenResDTO(
    String accessToken,
    String tokenType
) {}