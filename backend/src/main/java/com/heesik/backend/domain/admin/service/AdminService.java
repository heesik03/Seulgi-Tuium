package com.heesik.backend.domain.admin.service;

import com.heesik.backend.domain.admin.converter.AdminConverter;
import com.heesik.backend.domain.admin.dto.response.AdminDashboardResDTO;
import com.heesik.backend.domain.admin.dto.response.AdminUserListResDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.user.service.core.UserService;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.global.dto.PageResponse;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final UserService userService; // 회원 강제 탈퇴 시 연관 삭제 로직(카카오 unlink 등) 재사용
    private final WordRepository wordRepository;

    @Transactional(readOnly = true)
    public PageResponse<AdminUserListResDTO> getUserList(String name, Pageable pageable) {
        Page<User> users;
        if (name != null && !name.isBlank()) {
            users = userRepository.findByNameContaining(name, pageable);
        } else {
            users = userRepository.findAll(pageable);
        }
        Page<AdminUserListResDTO> dtoPage = users.map(AdminConverter::toAdminUserListResDTO);
        return PageResponse.of(dtoPage);
    }

    @Transactional(readOnly = true)
    public AdminDashboardResDTO getDashboardStats() {
        long totalUsers = userRepository.count();
        long totalWords = wordRepository.count();

        return AdminDashboardResDTO.builder()
                .totalUserCount(totalUsers)
                .totalWordCount(totalWords)
                .build();
    }

    @Transactional
    public void updateUserRole(Long userId, Role newRole) {
        User user = findUserEntity(userId);
        user.updateRole(newRole);
    }

    @Transactional
    public void deleteUserForce(Long userId) {
        userService.deleteUser(userId);
    }

    private User findUserEntity(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
    }

}
