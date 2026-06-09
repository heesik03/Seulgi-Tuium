package com.heesik.backend.domain.admin.converter;

import com.heesik.backend.domain.admin.dto.response.AdminUserListResDTO;
import com.heesik.backend.domain.user.entity.User;

public class AdminConverter {

    public AdminConverter() {}

    public static AdminUserListResDTO toAdminUserListResDTO(User user) {
        return AdminUserListResDTO.builder()
                .id(user.getId())
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .failedAttempts(user.getFailedAttempts())
                .isLocked(user.isLocked())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
