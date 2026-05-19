package com.heesik.backend.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateNameReqDTO (
        @NotBlank(message = "이름은 필수입니다.")
        @Size(max = 30, message = "이름은 30자 이하입니다.")
        String name
) {
}