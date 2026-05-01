package com.heesik.backend.domain.user.repository;

import com.heesik.backend.domain.user.entity.RefreshToken;
import com.heesik.backend.domain.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);

    // 토큰이 있으면 업데이트, 없으면 생성
    @Modifying(clearAutomatically = true)
    @Query(value = "INSERT INTO refresh_token (id, token, expiry_date) VALUES (:id, :token, :expiryDate) " +
            "ON DUPLICATE KEY UPDATE token = :token, expiry_date = :expiryDate", nativeQuery = true)
    void upsertToken(@Param("id") Long userId, @Param("token") String token, @Param("expiryDate") LocalDateTime expiryDate);
}
