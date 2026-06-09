package com.heesik.backend.domain.admin.dto.response;

import lombok.Builder;

@Builder
public record AdminDashboardResDTO(
        Long totalUserCount,
        Long totalWordCount
) {
}
