package com.heesik.backend.global.security;

import com.heesik.backend.domain.user.entity.User;
import org.jspecify.annotations.NonNull;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

public record CustomUserDetails(Long id, String email, String name, String role, boolean isLocked, String password) implements UserDetails {

    // JWT 복원용 생성자 (패스워드 비어있음)
    public CustomUserDetails(Long id, String email, String name, String role, boolean isLocked) {
        this(id, email, name, role, isLocked, "");
    }

    // User 엔티티 기반 생성자 (패스워드 포함)
    public CustomUserDetails(User user) {
        this(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole().name(),
                user.isLocked(),
                user.getPassword()
        );
    }

    @Override
    public @NonNull Collection<? extends GrantedAuthority> getAuthorities() {
        // role을 GrantedAuthority 형태로 변환하여 반환
        return Collections.singletonList(new SimpleGrantedAuthority(role));
    }

    public String getNickName() { return name; }

    @Override
    public String getPassword() {
        return password;
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