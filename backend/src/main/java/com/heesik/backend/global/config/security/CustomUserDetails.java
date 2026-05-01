package com.heesik.backend.global.config.security;

import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public record CustomUserDetails(Long id, String email, String role, boolean isLocked) implements UserDetails {

    @Override
    public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
        // role을 GrantedAuthority 형태로 변환하여 반환
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    @Override
    public String getPassword() {
        return "";
    }

    @Override
    public @NonNull String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() { return true; }

    // 잠겨있지 않아야(true) 로그인이 진행됨
    @Override
    public boolean isAccountNonLocked() {
        return !isLocked;
    }

    @Override
    public boolean isCredentialsNonExpired() { return true; }

    @Override
    public boolean isEnabled() { return true; }
}