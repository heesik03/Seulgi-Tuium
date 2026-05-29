package com.heesik.backend.global.security.dto;

import com.heesik.backend.domain.user.enums.OAuthProvider;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class KaKaoUserDTO {
    private final OAuthProvider provider;
    private final String socialUid;
    private final String email;
    private final String name;
}