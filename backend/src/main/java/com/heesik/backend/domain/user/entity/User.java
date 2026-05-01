package com.heesik.backend.domain.user.entity;

import com.heesik.backend.domain.user.enums.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 30)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role; // 권한 (사용자, 관리자)

    @CreatedDate
    @Column(updatable = false, nullable = false)
    private LocalDateTime createdAt; // 가입일

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt; // 정보 수정일

    // 비밀번호 틀린 횟수
    @Column(nullable = false)
    private Integer failedAttempts = 0;

    // 계정 잠금 발생 시간 (NULL이면 잠기지 않은 상태)
    @Column
    private LocalDateTime lockedAt;

    @Builder
    public User(String email, String password, String name, Role role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role != null ? role : Role.ROLE_USER;
        this.failedAttempts = 0;
    }

    // 비밀번호 틀린 횟수 증가
    public void incrementFailedAttempts() {
        this.failedAttempts++;
        if (this.failedAttempts >= 5) {
            this.lockedAt = LocalDateTime.now();
        }
    }

    // 계정 제한 해제
    public void resetLoginAttempts() {
        this.failedAttempts = 0;
        this.lockedAt = null;
    }

    // 잠금 시간 종료 확인
    public Boolean isAccountLocked() {
        final int LOCK_MINUTES = 30; // 잠금 시간 (30분)

        if (this.lockedAt != null) {
            // 잠금 시간 지났는지 확인
            if (this.lockedAt.plusMinutes(LOCK_MINUTES).isAfter(LocalDateTime.now())) {
                return true;
            } else {
                resetLoginAttempts();
                return false;
            }
        }
        return false;
    }

}
