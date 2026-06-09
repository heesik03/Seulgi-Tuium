package com.heesik.backend.domain.admin.controller;

import com.heesik.backend.domain.admin.dto.request.UpdateRoleReqDTO;
import com.heesik.backend.domain.admin.dto.response.AdminDashboardResDTO;
import com.heesik.backend.domain.admin.dto.response.AdminUserListResDTO;
import com.heesik.backend.domain.admin.service.AdminService;
import com.heesik.backend.global.dto.PageResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Tag(name = "관리자 전용 API", description = "회원 관리 및 권한 제어를 담당하는 관리자 전용 API (ROLE_ADMIN 권한 필요)")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/stats")
    @Operation(summary = "관리자 대시보드 통계", description = "전체 사용자 수 및 시스템 내 전체 단어 수를 조회합니다.")
    public ResponseEntity<AdminDashboardResDTO> getDashboardStats() {
        AdminDashboardResDTO response = adminService.getDashboardStats();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users")
    @Operation(summary = "전체 회원 목록 조회", description = "시스템 내의 모든 회원 목록을 이름으로 검색 및 페이징하여 조회합니다.")
    public ResponseEntity<PageResponse<AdminUserListResDTO>> getUserList(
            @RequestParam(required = false) String name,
            Pageable pageable
    ) {
        PageResponse<AdminUserListResDTO> response = adminService.getUserList(name, pageable);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/users/{userId}/role")
    @Operation(summary = "회원 권한 변경", description = "특정 회원의 권한(USER/ADMIN)을 변경합니다.")
    public ResponseEntity<Void> updateUserRole(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateRoleReqDTO request) {
        
        adminService.updateUserRole(userId, request.role());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{userId}")
    @Operation(summary = "회원 강제 탈퇴 처리", description = "관리자가 특정 회원을 강제로 탈퇴 처리하며, 연관 데이터도 모두 삭제됩니다.")
    public ResponseEntity<Void> deleteUserForce(@PathVariable Long userId) {
        adminService.deleteUserForce(userId);
        return ResponseEntity.noContent().build();
    }

}
