package com.heesik.backend.domain.admin.dto.response;

import com.heesik.backend.domain.user.enums.Role;
import lombok.Builder;

import java.time.LocalDateTime;

@Builder
public record AdminUserListResDTO(
        Long id,
        String email,
        String name,
        Role role,
        Integer failedAttempts,
        boolean isLocked,
        LocalDateTime createdAt
) {
}
