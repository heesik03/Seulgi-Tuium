package com.heesik.backend.domain.user.service.token;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TokenRedisService {

    private final StringRedisTemplate redisTemplate;

    private static final String REFRESH_TOKEN_KEY_PREFIX = "refresh:token:";
    private static final String REFRESH_USER_KEY_PREFIX = "refresh:user:";

    // Refresh Token 저장 및 기존 토큰 제거
    public void saveRefreshToken(String userId, String refreshToken, long refreshTimeMs) {
        Duration ttl = Duration.ofMillis(refreshTimeMs);
        String userKey = refreshUserKey(userId);

        // 기존 Refresh Token 조회
        String oldRefreshToken = redisTemplate.opsForValue().get(userKey);

        // 기존 토큰이 존재하면 Redis에서 삭제
        if (oldRefreshToken != null) {
            redisTemplate.delete(refreshTokenKey(oldRefreshToken));
        }

        // refreshToken -> userId 매핑 저장
        redisTemplate.opsForValue().set(refreshTokenKey(refreshToken), userId, ttl);

        // userId -> refreshToken 매핑 저장
        redisTemplate.opsForValue().set(userKey, refreshToken, ttl);
    }

    // Refresh Token 및 사용자 매핑 정보 삭제
    public void deleteRefreshToken(String refreshToken, String userId) {
        redisTemplate.delete(List.of(
                refreshTokenKey(refreshToken),
                refreshUserKey(userId)
        ));
    }

    // Refresh Token Key 기준으로 토큰 삭제
    public void deleteRefreshTokenByKey(String refreshToken) {
        redisTemplate.delete(refreshTokenKey(refreshToken));
    }

    // User ID를 기반으로 관련된 모든 Refresh Token 정보 일괄 삭제 (강제 로그아웃용)
    public void deleteAllTokensByUserId(String userId) {
        String userKey = refreshUserKey(userId);
        String refreshToken = redisTemplate.opsForValue().get(userKey);

        if (refreshToken != null) {
            redisTemplate.delete(List.of(
                    userKey,
                    refreshTokenKey(refreshToken)
            ));
        }
    }

    // Refresh Token으로 사용자 ID 조회
    public String getUserIdByRefreshToken(String refreshToken) {
        return redisTemplate.opsForValue().get(refreshTokenKey(refreshToken));
    }

    // Refresh Token Redis Key 생성
    private String refreshTokenKey(String refreshToken) {
        return REFRESH_TOKEN_KEY_PREFIX + refreshToken;
    }

    // 사용자 Redis Key 생성
    private String refreshUserKey(String userId) {
        return REFRESH_USER_KEY_PREFIX + userId;
    }
}