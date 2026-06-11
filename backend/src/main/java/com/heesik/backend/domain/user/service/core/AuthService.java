package com.heesik.backend.domain.user.service.core;

import com.heesik.backend.domain.user.converter.UserConverter;
import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.user.service.token.TokenRedisService;
import com.heesik.backend.domain.user.service.token.TokenService;
import com.heesik.backend.global.security.enums.TokenType;
import com.heesik.backend.global.security.service.JwtProvider;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuthService {

    private final UserRepository userRepository;
    private final TokenService tokenService;
    private final TokenRedisService tokenRedisService;

    private final JwtProvider jwtProvider;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;

    // 로그인
    @Transactional(noRollbackFor =
            {BadCredentialsException.class, UserException.class, UsernameNotFoundException.class, LockedException.class}
    )
    public TokenPair login(LoginReqDTO request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.email(),
                            request.password()
                    )
            );

            CustomUserDetails principal = (CustomUserDetails) authentication.getPrincipal();

            User user = userRepository.findById(principal.id())
                    .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

            user.loginSuccess(); // 로그인 완료 처리

            return tokenService.issueToken(user);

        } catch (UsernameNotFoundException e) {
            // 사용자가 존재하지 않는 경우 처리
            throw new UserException(UserErrorCode.USER_NOT_FOUND);
        } catch (LockedException e) {
            // 계정이 잠금 상태인 경우 처리
            throw new UserException(UserErrorCode.ACCOUNT_LOCKED);
        } catch (BadCredentialsException e) {
            // 패스워드 불일치 시 실패 횟수 가산 및 잠금 상태 관리용 RDB 조회 1회 수행
            User user = userRepository.findByEmail(request.email())
                    .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

            if (user.loginFail()) {
                throw new UserException(UserErrorCode.ACCOUNT_LOCKED);
            }
            throw new UserException(UserErrorCode.PASSWORD_MISMATCH);
        }
    }

    // 리프레쉬 토큰 재발급
    @Transactional
    public TokenPair refresh(String refreshToken) {
        Claims claims;

        // 토큰 payload 추출 및 검증
        try {
            claims = jwtProvider.getClaims(refreshToken);
        } catch (UserException e) {
            if (e.getErrorCode() == UserErrorCode.EXPIRED_JWT_TOKEN) {
                tokenRedisService.deleteRefreshTokenByKey(refreshToken);
                throw new UserException(UserErrorCode.EXPIRED_REFRESH_TOKEN);
            }
            throw e;
        }
        if (jwtProvider.getTokenType(claims) != TokenType.REFRESH) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }

        String userId = tokenRedisService.getUserIdByRefreshToken(refreshToken);
        if (userId == null) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }
        tokenRedisService.deleteRefreshToken(refreshToken, userId); // 기존 토큰 삭제

        User user = userRepository.findById(parseUserId(userId))
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        return tokenService.issueToken(user);
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

    private Long parseUserId(String userId) {
        try {
            return Long.parseLong(userId);
        } catch (NumberFormatException e) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }
    }

}
