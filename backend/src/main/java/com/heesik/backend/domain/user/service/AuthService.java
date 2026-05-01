package com.heesik.backend.domain.user.service;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.entity.RefreshToken;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.RefreshTokenRepository;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.config.security.JwtProvider;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;

    private static final long ACCESS_TIME = 1000L * 60 * 30; // 엑세스 토큰 유효기간 (30분)
    private static final long REFRESH_TIME = 1000L * 60 * 60 * 24 * 14; // 리프레쉬 토큰 유효기간 (14일)

    // 로그인
    @Transactional(noRollbackFor = {BadCredentialsException.class, LockedException.class})
    public TokenPair login(LoginReqDTO request) {

        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 계정 잠금 체크
        if (user.isLocked()) {
            throw new LockedException("계정이 잠금 상태입니다.");
        }

        // 비밀번호 검증
        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            user.loginFail();
            throw new BadCredentialsException("비밀번호 불일치");
        }

        // 성공 처리
        user.loginSuccess();

        return issueToken(user); // 토큰 발급
    }

    // 리프레쉬 토큰 재발급
    @Transactional
    public TokenPair refresh(String refreshToken) {

        RefreshToken stored = refreshTokenRepository.findByToken(refreshToken)
                .orElseThrow(() -> new UserException(UserErrorCode.INVALID_REFRESH_TOKEN));

        // 만료 체크
        if (stored.getExpiryDate().isBefore(LocalDateTime.now())) {
            refreshTokenRepository.delete(stored);
            throw new UserException(UserErrorCode.EXPIRED_REFRESH_TOKEN);
        }

        // 기존 토큰 삭제
        refreshTokenRepository.delete(stored);

        return issueToken(stored.getUser());
    }


    @Transactional
    public void logout(String refreshToken) {
        refreshTokenRepository.findByToken(refreshToken)
                .ifPresent(refreshTokenRepository::delete);
    }

    // 회원가입
    @Transactional
    public void createUser(SignUpReqDTO request) {

        String encodedPassword = passwordEncoder.encode(request.password());

        User user = User.builder()
                .name(request.userName())
                .email(request.email())
                .password(encodedPassword)
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);
    }

    // 토큰 발급 및 DB 저장
    private TokenPair issueToken(User user) {
        String access = jwtProvider.createToken(user, ACCESS_TIME);
        String refresh = jwtProvider.createToken(user, REFRESH_TIME);

        LocalDateTime expiry = LocalDateTime.now()
                .plusSeconds(REFRESH_TIME / 1000);

        refreshTokenRepository.save(
                RefreshToken.builder()
                        .user(user)
                        .token(refresh)
                        .expiryDate(expiry)
                        .build()
        );

        return new TokenPair(access, refresh);
    }
}