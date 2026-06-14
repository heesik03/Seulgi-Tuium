package com.heesik.backend.domain.user.dto.response;

import lombok.Builder;

@Builder
public record UserSearchResDTO(
    Long id,
    String name
) {}

