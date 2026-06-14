package com.heesik.backend.domain.user.repository;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.OAuthProvider;
import org.springframework.data.jpa.repository.JpaRepository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;
import java.util.List;

public interface UserRepository extends JpaRepository <User, Long> {
    Optional<User> findByEmail(String email);

    Optional<User> findByName(String name);

    Page<User> findByNameContaining(String name, Pageable pageable);

    boolean existsByName(String name);

    boolean existsByEmail(String email);

    Optional<User> findByProviderAndProviderId(
            OAuthProvider provider,
            String providerId
    );

    List<User> findByNameContainingAndIdNot(String name, Long id);
}
