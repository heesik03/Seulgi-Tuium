package com.heesik.backend.domain.user.dto.response;

import com.heesik.backend.domain.user.enums.OAuthProvider;
import com.heesik.backend.domain.user.enums.Role;
import lombok.Builder;

@Builder
public record MyPageResDTO(
        String email,
        String name,
        Role role,
        OAuthProvider provider,
        Integer wordBookCount,
        Integer favoriteWordCount,
        Integer quizCount
) {
}
