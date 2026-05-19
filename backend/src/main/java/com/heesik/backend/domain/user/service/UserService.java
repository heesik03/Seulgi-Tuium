package com.heesik.backend.domain.user.service;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.UpdatePasswordReqDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuthService authService;
    private final TokenRedisService tokenRedisService;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public TokenPair updateUserName(String name, Long userId) {
        User user = findUserEntity(userId);
        user.updateName(name);

        return authService.issueToken(user); // 토큰 새로 발급
    }

    @Transactional
    public void updateUserPassword(UpdatePasswordReqDTO request, Long userId) {
        User user = findUserEntity(userId);

        if (!passwordEncoder.matches(request.currentPassword(), user.getPassword())) {
            boolean isLocked = user.loginFail();
            if (isLocked) {
                // 5회 오류로 계정이 방금 잠겼다면 즉시 모든 Refresh Token 파기 (강제 로그아웃)
                tokenRedisService.deleteAllTokensByUserId(String.valueOf(user.getId()));
            }
            throw new UserException(UserErrorCode.PASSWORD_MISMATCH);
        }

        String encodedPassword = passwordEncoder.encode(request.newPassword());
        user.updatePassword(encodedPassword);
    }

    private User findUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

}
