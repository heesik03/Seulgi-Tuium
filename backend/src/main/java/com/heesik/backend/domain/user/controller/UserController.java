package com.heesik.backend.domain.user.controller;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.DeleteAccountReqDTO;
import com.heesik.backend.domain.user.dto.request.UpdatePasswordReqDTO;
import com.heesik.backend.domain.user.dto.response.TokenResDTO;
import com.heesik.backend.domain.user.service.AuthService;
import com.heesik.backend.domain.user.service.UserService;
import com.heesik.backend.global.security.CustomUserDetails;
import com.heesik.backend.global.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@Validated
@RestController
@RequestMapping("/api/user")
@RequiredArgsConstructor
@Tag(name = "사용자 정보 API", description = "사용자 정보 CRUD API (로그인 필요)")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    private static final long REFRESH_TIME = 60 * 60 * 24 * 14; // 리프레쉬 토큰 유효 기간 (14일)

    @PatchMapping("/name/{name}")
    @Operation(summary = "이름 변경 및 토큰 재발급", description = "이름 변경 시 JWT 클레임 최신화를 위해 새로운 토큰을 발급.")
    public ResponseEntity<TokenResDTO> changeName(@PathVariable @Size(max = 30, message = "이름은 30자 이하입니다.") String name,
                                                  @AuthenticationPrincipal CustomUserDetails userDetails,
                                                  HttpServletResponse response) {

        TokenPair token = userService.updateUserName(name, userDetails.id());

        ResponseCookie cookie = CookieUtil.createRefreshCookie(token.refreshToken(), REFRESH_TIME);
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
    @Operation(summary = "회원 탈퇴", description = "비밀번호 확인 후 사용자 정보와 관련 테이블을 삭제합니다.")
    public ResponseEntity<Void> deleteAccount(@Valid @RequestBody DeleteAccountReqDTO request,
                                              @CookieValue(value = "refreshToken", required = false) String refreshToken,
                                              @AuthenticationPrincipal CustomUserDetails userDetails,
                                              HttpServletResponse response) {
        userService.deleteUser(userDetails.id(), request.password());

        // 로그아웃 처리
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }
        CookieUtil.addDeleteCookie(response);

        return ResponseEntity.noContent().build();
    }

}
