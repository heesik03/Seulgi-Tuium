package com.heesik.backend.domain.user.controller;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.UpdatePasswordReqDTO;
import com.heesik.backend.domain.user.dto.response.TokenResDTO;
import com.heesik.backend.domain.user.dto.response.UserSearchResDTO;
import com.heesik.backend.domain.user.service.core.AuthService;
import com.heesik.backend.domain.user.service.core.UserService;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import com.heesik.backend.global.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import com.heesik.backend.domain.user.dto.response.MyPageResDTO;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Value;

import java.util.List;

@Validated
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "사용자 정보 API", description = "사용자 정보 CRUD API (로그인 필요)")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    @Value("${jwt.refresh-token-expiration-seconds}")
    private Long refreshTime;

    @GetMapping("/me")
    @Operation(summary = "마이페이지 조회", description = "현재 로그인한 사용자의 프로필 정보와 통계를 조회합니다.")
    public ResponseEntity<MyPageResDTO> getMyPage(@AuthenticationPrincipal CustomUserDetails userDetails) {
        MyPageResDTO response = userService.getMyPage(userDetails.id());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    @Operation(summary = "사용자 이름 검색", description = "친구 초대를 위해 사용자 이름을 검색합니다. (자신 제외)")
    public ResponseEntity<List<UserSearchResDTO>> searchUsers(@RequestParam("name") @NotBlank(message = "검색할 이름은 필수입니다.") String name,
                                                              @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<UserSearchResDTO> response = userService.searchUsers(name, userDetails.id());
        return ResponseEntity.ok(response);
    }


    @PatchMapping("/name/{name}")
    @Operation(summary = "이름 변경 및 토큰 재발급", description = "이름 변경 시 JWT 클레임 최신화를 위해 새로운 토큰을 발급.")
    public ResponseEntity<TokenResDTO> changeName(@PathVariable @Size(max = 30, message = "이름은 30자 이하입니다.") String name,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails,
                                                  HttpServletResponse response) {

        TokenPair token = userService.updateUserName(name, userDetails.id());

        ResponseCookie cookie = CookieUtil.createRefreshCookie(token.refreshToken(), refreshTime);
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        return ResponseEntity.ok(new TokenResDTO(token.accessToken(), "Bearer"));
    }


    @PatchMapping("/password")
    @Operation(
            summary = "비밀번호 변경 및 로그아웃 처리",
            description = "비밀번호를 암호화하여 저장 후 JWT를 삭제(로그아웃 처리)합니다.")
    public ResponseEntity<Void> changePassword(@Valid @RequestBody UpdatePasswordReqDTO request,
                                               @CookieValue(value = "refreshToken", required = false) String refreshToken,
                                               @AuthenticationPrincipal CustomUserDetails userDetails,
                                               HttpServletResponse response) {
        userService.updateUserPassword(request, userDetails.id());

        // 로그아웃 처리
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        CookieUtil.addDeleteCookie(response);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    @Operation(summary = "회원 탈퇴", description = "사용자 정보와 관련 테이블을 삭제합니다. 소셜 로그인일 경우 연결을 끊습니다.")
    public ResponseEntity<Void> deleteAccount(@CookieValue(value = "refreshToken", required = false) String refreshToken,
                                              @AuthenticationPrincipal CustomUserDetails userDetails,
                                              HttpServletResponse response) {
        userService.deleteUser(userDetails.id());

        // 로그아웃 처리
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        CookieUtil.addDeleteCookie(response);

        return ResponseEntity.noContent().build();
    }

}
