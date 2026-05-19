package com.heesik.backend.domain.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public record UpdatePasswordReqDTO(
        @NotBlank(message = "기존 비밀번호는 필수입니다.")
        String currentPassword,

        @NotBlank(message = "새 비밀번호는 필수입니다.")
        @Pattern(
                regexp = "^(?=.*[A-Za-z])(?=.*\\d)(?=.*[\\W_])(?!.*(.)\\1\\1).{8,30}$",
                message = "새 비밀번호는 8~30자, 영문/숫자/특수문자를 포함하고 같은 문자를 3번 연속 사용할 수 없습니다."
        )
        String newPassword

) { }