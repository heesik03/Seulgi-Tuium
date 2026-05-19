package com.heesik.backend.domain.user.service;

import com.heesik.backend.domain.user.dto.request.UpdatePasswordReqDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @InjectMocks
    private UserService userService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuthService authService;

    @Mock
    private TokenRedisService tokenRedisService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("비밀번호 변경 성공")
    void updateUserPassword_Success() {
        // given
        Long userId = 1L;
        UpdatePasswordReqDTO req = new UpdatePasswordReqDTO("oldPassword123!", "newPassword123!");
        User user = User.builder()
                .email("test@test.com")
                .password("encodedOldPassword")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        setUserId(user, userId);

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(req.currentPassword(), user.getPassword())).willReturn(true);
        given(passwordEncoder.encode(req.newPassword())).willReturn("encodedNewPassword");

        // when
        userService.updateUserPassword(req, userId);

        // then
        assertThat(user.getPassword()).isEqualTo("encodedNewPassword");
        verify(passwordEncoder).encode(req.newPassword());
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 사용자를 찾을 수 없음")
    void updateUserPassword_UserNotFound() {
        // given
        Long userId = 1L;
        UpdatePasswordReqDTO req = new UpdatePasswordReqDTO("oldPassword123!", "newPassword123!");
        given(userRepository.findById(userId)).willReturn(Optional.empty());

        // when & then
        assertThatThrownBy(() -> userService.updateUserPassword(req, userId))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.USER_NOT_FOUND);
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 기존 비밀번호 불일치")
    void updateUserPassword_PasswordMismatch() {
        // given
        Long userId = 1L;
        UpdatePasswordReqDTO req = new UpdatePasswordReqDTO("wrongPassword!", "newPassword123!");
        User user = User.builder()
                .email("test@test.com")
                .password("encodedOldPassword")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        setUserId(user, userId);

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(req.currentPassword(), user.getPassword())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.updateUserPassword(req, userId))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.PASSWORD_MISMATCH);
        
        assertThat(user.getFailedAttempts()).isEqualTo(1);
    }

    @Test
    @DisplayName("비밀번호 변경 실패 - 5회 실패로 인한 계정 잠금 발생")
    void updateUserPassword_AccountLocked() {
        // given
        Long userId = 1L;
        UpdatePasswordReqDTO req = new UpdatePasswordReqDTO("wrongPassword!", "newPassword123!");
        User user = User.builder()
                .email("test@test.com")
                .password("encodedOldPassword")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        setUserId(user, userId);

        // 강제로 4회 실패 상태로 설정
        for (int i = 0; i < 4; i++) {
            user.loginFail();
        }

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(req.currentPassword(), user.getPassword())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.updateUserPassword(req, userId))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.PASSWORD_MISMATCH);

        assertThat(user.getFailedAttempts()).isEqualTo(5);
        assertThat(user.getLockedAt()).isNotNull();
        verify(tokenRedisService).deleteAllTokensByUserId(String.valueOf(userId));
    }

    @Test
    @DisplayName("회원 탈퇴 성공")
    void deleteUser_Success() {
        // given
        Long userId = 1L;
        String password = "password123!";
        User user = User.builder()
                .email("test@test.com")
                .password("encodedPassword")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        setUserId(user, userId);

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(password, user.getPassword())).willReturn(true);

        // when
        userService.deleteUser(userId, password);

        // then
        verify(userRepository).delete(user);
    }

    @Test
    @DisplayName("회원 탈퇴 실패 - 비밀번호 불일치")
    void deleteUser_PasswordMismatch() {
        // given
        Long userId = 1L;
        String password = "wrongPassword!";
        User user = User.builder()
                .email("test@test.com")
                .password("encodedPassword")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        setUserId(user, userId);

        given(userRepository.findById(userId)).willReturn(Optional.of(user));
        given(passwordEncoder.matches(password, user.getPassword())).willReturn(false);

        // when & then
        assertThatThrownBy(() -> userService.deleteUser(userId, password))
                .isInstanceOf(UserException.class)
                .hasFieldOrPropertyWithValue("errorCode", UserErrorCode.PASSWORD_MISMATCH);
    }

    private void setUserId(User user, Long id) {
        ReflectionTestUtils.setField(user, "id", id);
    }
}
