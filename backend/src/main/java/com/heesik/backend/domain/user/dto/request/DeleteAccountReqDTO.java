package com.heesik.backend.domain.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "회원 탈퇴 요청 DTO")
public record DeleteAccountReqDTO(
        @NotBlank(message = "비밀번호는 필수 입력 값입니다.")
        @Schema(description = "현재 비밀번호", example = "password123!")
        String password
) {
}
