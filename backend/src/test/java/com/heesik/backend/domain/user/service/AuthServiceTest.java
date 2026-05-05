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
import com.heesik.backend.global.error.exception.UserException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private RefreshTokenRepository refreshTokenRepository;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("로그인 성공")
    void login_Success() {
        // given
        LoginReqDTO req = new LoginReqDTO("test@test.com", "password123!");
        User user = User.builder()
                .email("test@test.com")
                .password("encoded_password")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();

        given(userRepository.findByEmail(req.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(req.password(), user.getPassword())).willReturn(true);
        given(jwtProvider.createToken(any(User.class), anyLong())).willReturn("access_token", "refresh_token");

        // when
        TokenPair tokenPair = authService.login(req);

        // then
        assertThat(tokenPair.accessToken()).isEqualTo("access_token");
        assertThat(tokenPair.refreshToken()).isEqualTo("refresh_token");
        verify(refreshTokenRepository).save(any(RefreshToken.class));
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 사용자")
    void login_UserNotFound() {
        // given
        LoginReqDTO req = new LoginReqDTO("notfound@test.com", "password123!");
        given(userRepository.findByEmail(req.email())).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UserException.class);
    }

    @Test
    @DisplayName("로그인 실패 - 비밀번호 불일치 (실패 횟수 증가)")
    void login_BadCredentials() {
        // given
        LoginReqDTO req = new LoginReqDTO("test@test.com", "wrong_password!");
        User user = User.builder()
                .email("test@test.com")
                .password("encoded_password")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();

        given(userRepository.findByEmail(req.email())).willReturn(Optional.of(user));
        given(passwordEncoder.matches(req.password(), user.getPassword())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(BadCredentialsException.class);
        assertThat(user.getFailedAttempts()).isEqualTo(1); // 실패 횟수가 증가했는지 확인
    }

    @Test
    @DisplayName("로그인 실패 - 계정 잠김")
    void login_Locked() {
        // given
        LoginReqDTO req = new LoginReqDTO("test@test.com", "password123!");
        User user = User.builder()
                .email("test@test.com")
                .password("encoded_password")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        
        // 강제로 로그인 5번 실패 처리하여 계정 잠금
        for (int i = 0; i < 5; i++) {
            user.loginFail();
        }

        given(userRepository.findByEmail(req.email())).willReturn(Optional.of(user));

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(LockedException.class);
    }

    @Test
    @DisplayName("토큰 재발급 성공")
    void refresh_Success() {
        // given
        String oldRefreshToken = "old_refresh_token";
        User user = User.builder()
                .email("test@test.com")
                .password("encoded_password")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        RefreshToken storedToken = RefreshToken.builder()
                .user(user)
                .token(oldRefreshToken)
                .expiryDate(LocalDateTime.now().plusDays(1)) // 만료 전
                .build();

        given(refreshTokenRepository.findByToken(oldRefreshToken)).willReturn(Optional.of(storedToken));
        given(jwtProvider.createToken(any(User.class), anyLong())).willReturn("new_access", "new_refresh");

        // when
        TokenPair tokenPair = authService.refresh(oldRefreshToken);

        // then
        assertThat(tokenPair.accessToken()).isEqualTo("new_access");
        assertThat(tokenPair.refreshToken()).isEqualTo("new_refresh");
        verify(refreshTokenRepository).delete(storedToken); // 기존 토큰 삭제 검증
        verify(refreshTokenRepository).save(any(RefreshToken.class)); // 새 토큰 저장 검증
    }

    @Test
    @DisplayName("토큰 재발급 실패 - 만료된 토큰")
    void refresh_Expired() {
        // given
        String oldRefreshToken = "old_refresh_token";
        User user = User.builder().build();
        RefreshToken storedToken = RefreshToken.builder()
                .user(user)
                .token(oldRefreshToken)
                .expiryDate(LocalDateTime.now().minusDays(1)) // 만료됨
                .build();

        given(refreshTokenRepository.findByToken(oldRefreshToken)).willReturn(Optional.of(storedToken));

        // when & then
        assertThatThrownBy(() -> authService.refresh(oldRefreshToken))
                .isInstanceOf(UserException.class);
        verify(refreshTokenRepository).delete(storedToken); // 만료된 토큰 삭제 검증
    }

    @Test
    @DisplayName("회원가입 성공")
    void createUser_Success() {
        // given
        SignUpReqDTO req = new SignUpReqDTO("테스터", "test@test.com", "Password123!");
        given(passwordEncoder.encode(req.password())).willReturn("encoded_password");

        // when
        authService.createUser(req);

        // then
        verify(userRepository).save(any(User.class));
    }
}
