package com.heesik.backend.global.config.security;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

import java.util.Objects;

public class PepperedPasswordEncoder implements PasswordEncoder {

    private final PasswordEncoder delegate;
    private final String pepper;

    public PepperedPasswordEncoder(String pepper) {
        this.delegate = new BCryptPasswordEncoder();
        this.pepper = pepper;
    }

    @Override
    public String encode(CharSequence rawPassword) {
        return delegate.encode(Objects.requireNonNull(rawPassword).toString() + pepper);
    }

    @Override
    public boolean matches(CharSequence rawPassword, String encodedPassword) {
        return delegate.matches(Objects.requireNonNull(rawPassword).toString() + pepper, encodedPassword);
    }
}
