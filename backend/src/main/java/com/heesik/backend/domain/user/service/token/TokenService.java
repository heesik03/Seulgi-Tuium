package com.heesik.backend.domain.user.service.token;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.security.service.JwtProvider;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class TokenService {

    private final UserRepository userRepository;
    private final TokenRedisService tokenRedisService;
    private final JwtProvider jwtProvider;

    @Value("${jwt.access-token-expiration-seconds}")
    private Long accessTime;

    @Value("${jwt.refresh-token-expiration-seconds}")
    private Long refreshTime;

    // 소셜 로그인 성공 유저의 토큰 발급 전담
    @Transactional(readOnly = true)
    public TokenPair loginOAuth(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        return issueToken(user);
    }

    // 공통 토큰 발급 및 Redis 저장
    @Transactional(readOnly = true)
    public TokenPair issueToken(User user) {
        String access = jwtProvider.createAccessToken(user, accessTime);
        String refresh = jwtProvider.createRefreshToken(user, refreshTime);

        tokenRedisService.saveRefreshToken(
                String.valueOf(user.getId()),
                refresh,
                refreshTime
        );

        return new TokenPair(access, refresh);
    }

    // 쿠키 초단위 만료 시간 반환
    public Long getRefreshTimeInSeconds() {
        return refreshTime / 1000;
    }

}