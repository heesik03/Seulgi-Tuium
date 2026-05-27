package com.heesik.backend.domain.user.entity;

import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.word.entity.FavoriteWord;
import com.heesik.backend.domain.word.entity.WordBook;
import com.heesik.backend.global.entity.BaseTimeEntity;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@EntityListeners(AuditingEntityListener.class)
public class User extends BaseTimeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, unique = true, length = 30)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role; // 권한 (사용자, 관리자)

    // 비밀번호 틀린 횟수
    @Column(nullable = false)
    private Integer failedAttempts = 0;

    // 계정 잠금 발생 시간 (NULL이면 잠기지 않은 상태)
    @Column
    private LocalDateTime lockedAt;


    /** ============ 연관관계 매핑 ============ */
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WordBook> wordBooks = new ArrayList<>(); // 단어장

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<FavoriteWord> favoriteWords = new ArrayList<>(); // 즐겨찾기 단어


    @Builder
    public User(String email, String password, String name, Role role) {
        this.email = email;
        this.password = password;
        this.name = name;
        this.role = role != null ? role : Role.ROLE_USER;
        this.failedAttempts = 0;
    }

    public void updateName(String name) {
        this.name = name;
    }

    public void updatePassword(String password) {
        this.password = password;
    }

    // 로그인 실패 처리
    public boolean loginFail() {
        final int MAX_FAILED_ATTEMPTS = 5; // 로그인 최대 횟수

        this.failedAttempts++;

        if (this.failedAttempts >= MAX_FAILED_ATTEMPTS) {
            this.lockedAt = LocalDateTime.now(); // 잠금 시간 기록
            return true; // 계정 잠금 발생
        }
        
        return false;
    }

    // 로그인 성공 처리
    public void loginSuccess() {
        this.failedAttempts = 0;
        this.lockedAt = null;
    }

    // 계정 잠금 여부
    public boolean isLocked() {
        final int LOCK_MINUTES = 30; // 잠금 시간 (30분)

        if (lockedAt == null) return false;

        // 30분 잠금
        return lockedAt.plusMinutes(LOCK_MINUTES).isAfter(LocalDateTime.now());
    }

}
