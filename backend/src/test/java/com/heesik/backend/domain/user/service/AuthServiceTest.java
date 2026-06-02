package com.heesik.backend.domain.user.service;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.user.service.core.AuthService;
import com.heesik.backend.domain.user.service.token.TokenRedisService;
import com.heesik.backend.domain.user.service.token.TokenService;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import com.heesik.backend.global.security.enums.TokenType;
import com.heesik.backend.global.security.service.JwtProvider;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.LockedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @InjectMocks
    private AuthService authService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private TokenService tokenService;

    @Mock
    private TokenRedisService tokenRedisService;

    @Mock
    private JwtProvider jwtProvider;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

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
        setUserId(user, 1L);

        Authentication authentication = mock(Authentication.class);
        CustomUserDetails userDetails = new CustomUserDetails(1L, "test@test.com", "테스터", Role.ROLE_USER.name(), false, "encoded_password");

        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).willReturn(authentication);
        given(authentication.getPrincipal()).willReturn(userDetails);
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(tokenService.issueToken(user)).willReturn(new TokenPair("access_token", "refresh_token"));

        // when
        TokenPair tokenPair = authService.login(req);

        // then
        assertThat(tokenPair.accessToken()).isEqualTo("access_token");
        assertThat(tokenPair.refreshToken()).isEqualTo("refresh_token");
    }

    @Test
    @DisplayName("로그인 실패 - 존재하지 않는 사용자")
    void login_UserNotFound() {
        // given
        LoginReqDTO req = new LoginReqDTO("notfound@test.com", "password123!");
        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willThrow(new UsernameNotFoundException("User not found"));

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.USER_NOT_FOUND);
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

        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willThrow(new BadCredentialsException("Bad credentials"));
        given(userRepository.findByEmail(req.email())).willReturn(Optional.of(user));

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.PASSWORD_MISMATCH);
        assertThat(user.getFailedAttempts()).isEqualTo(1); // 실패 횟수가 증가했는지 확인
    }

    @Test
    @DisplayName("로그인 실패 - 계정 잠김")
    void login_Locked() {
        // given
        LoginReqDTO req = new LoginReqDTO("test@test.com", "password123!");
        given(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .willThrow(new LockedException("Account is locked"));

        // when & then
        assertThatThrownBy(() -> authService.login(req))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.ACCOUNT_LOCKED);
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
        setUserId(user, 1L);
        Claims claims = mock(Claims.class);

        given(jwtProvider.getClaims(oldRefreshToken)).willReturn(claims);
        given(jwtProvider.getTokenType(claims)).willReturn(TokenType.REFRESH);
        given(tokenRedisService.getUserIdByRefreshToken(oldRefreshToken)).willReturn("1");
        given(userRepository.findById(1L)).willReturn(Optional.of(user));
        given(tokenService.issueToken(user)).willReturn(new TokenPair("new_access", "new_refresh"));

        // when
        TokenPair tokenPair = authService.refresh(oldRefreshToken);

        // then
        assertThat(tokenPair.accessToken()).isEqualTo("new_access");
        assertThat(tokenPair.refreshToken()).isEqualTo("new_refresh");
        verify(tokenRedisService).deleteRefreshToken(eq(oldRefreshToken), eq("1"));
    }

    @Test
    @DisplayName("토큰 재발급 실패 - 만료된 토큰")
    void refresh_Expired() {
        // given
        String oldRefreshToken = "old_refresh_token";
        given(jwtProvider.getClaims(oldRefreshToken))
                .willThrow(new UserException(UserErrorCode.EXPIRED_JWT_TOKEN));

        // when & then
        assertThatThrownBy(() -> authService.refresh(oldRefreshToken))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.EXPIRED_REFRESH_TOKEN);
        verify(tokenRedisService).deleteRefreshTokenByKey(eq(oldRefreshToken));
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

    private void setUserId(User user, Long id) {
        ReflectionTestUtils.setField(user, "id", id);
    }
}
