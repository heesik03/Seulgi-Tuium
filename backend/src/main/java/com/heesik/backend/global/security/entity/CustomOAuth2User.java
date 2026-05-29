package com.heesik.backend.global.security.entity;

import com.heesik.backend.domain.user.enums.OAuthProvider;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.util.Collection;
import java.util.List;
import java.util.Map;

@Getter
@RequiredArgsConstructor
public class CustomOAuth2User implements OAuth2User {

    private final Long userId;
    private final String email;
    private final String role;
    private final OAuthProvider provider;
    private final String socialUid;

    @Override
    public Map<String, Object> getAttributes() {
        return Map.of(
                "userId", userId,
                "email", email
        );
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getName() {
        return socialUid;
    }
}