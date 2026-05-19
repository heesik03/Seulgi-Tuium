package com.heesik.backend.domain.user.service;

import com.heesik.backend.domain.user.converter.UserConverter;
import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.config.security.JwtProvider;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final TokenRedisService tokenRedisService;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    private static final long ACCESS_TIME = 1000L * 60 * 30; // 엑세스 토큰 유효기간 (30분)
    private static final long REFRESH_TIME = 1000L * 60 * 60 * 24 * 14; // 리프레쉬 토큰 유효기간 (14일)

    // 로그인
    @Transactional(noRollbackFor = {UserException.class})
    public TokenPair login(LoginReqDTO request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 계정 잠금 체크
        if (user.isLocked()) {
            throw new UserException(UserErrorCode.ACCOUNT_LOCKED);
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            user.loginFail();
            throw new UserException(UserErrorCode.PASSWORD_MISMATCH);
        }

        // 성공 처리
        user.loginSuccess();

        return issueToken(user); // 토큰 발급
    }

    // 리프레쉬 토큰 재발급
    @Transactional
    public TokenPair refresh(String refreshToken) {
        validateRefreshToken(refreshToken); // 토큰 검증

        String userId = tokenRedisService.getUserIdByRefreshToken(refreshToken);
        if (userId == null) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }

        tokenRedisService.deleteRefreshToken(refreshToken, userId);

        User user = userRepository.findById(parseUserId(userId))
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        return issueToken(user);
    }

    @Transactional
    public void logout(String refreshToken) {
        String userId = tokenRedisService.getUserIdByRefreshToken(refreshToken);
        if (userId != null) {
            tokenRedisService.deleteRefreshToken(refreshToken, userId);
        }
    }

    // 회원가입
    @Transactional
    public void createUser(SignUpReqDTO request) {
        String encodedPassword = passwordEncoder.encode(request.password());

        User user = UserConverter.touser(request, encodedPassword);
        userRepository.save(user);
    }

    // 이름 중복 체크
    @Transactional(readOnly = true)
    public boolean isNameDuplicated(String name) {
        return userRepository.existsByName(name);
    }

    // 이메일 중복 체크
    @Transactional(readOnly = true)
    public boolean isEmailDuplicated(String email) {
        return userRepository.existsByEmail(email);
    }

    // 토큰 발급 및 Redis 저장
    public TokenPair issueToken(User user) {
        String access = jwtProvider.createToken(user, ACCESS_TIME);
        String refresh = jwtProvider.createToken(user, REFRESH_TIME);

        tokenRedisService.saveRefreshToken(String.valueOf(user.getId()), refresh, REFRESH_TIME);

        return new TokenPair(access, refresh);
    }

    private void validateRefreshToken(String refreshToken) {
        try {
            jwtProvider.validateToken(refreshToken);
        } catch (UserException e) {
            if (e.getErrorCode() == UserErrorCode.EXPIRED_JWT_TOKEN) {
                tokenRedisService.deleteRefreshTokenByKey(refreshToken);
                throw new UserException(UserErrorCode.EXPIRED_REFRESH_TOKEN);
            }
            throw e;
        }
    }

    private Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException e) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

}
