package com.heesik.backend.domain.user.dto;

public record TokenPair(
        String accessToken,
        String refreshToken
) {}