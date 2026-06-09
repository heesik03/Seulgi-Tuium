package com.heesik.backend.domain.admin.dto.request;

import com.heesik.backend.domain.user.enums.Role;
import jakarta.validation.constraints.NotNull;

public record UpdateRoleReqDTO(
        @NotNull(message = "변경할 권한은 필수 입력값입니다.")
        Role role
) {
}
