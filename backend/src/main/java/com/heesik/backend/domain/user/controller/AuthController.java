package com.heesik.backend.domain.user.controller;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.dto.response.TokenResDTO;
import com.heesik.backend.domain.user.service.AuthService;
import com.heesik.backend.global.util.CookieUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "사용자 인증 API")
public class AuthController {

    private final AuthService authService;

    private static final long REFRESH_TIME = 60 * 60 * 24 * 14; // 리프레쉬 토큰 유효 기간 (14일)

    @PostMapping("/login")
    @Operation(summary = "로그인")
    public ResponseEntity<TokenResDTO> login(
            @Valid @RequestBody LoginReqDTO request,
            HttpServletResponse response
    ) {
        TokenPair token = authService.login(request);

        ResponseCookie cookie =
                CookieUtil.createRefreshCookie(token.refreshToken(), REFRESH_TIME);

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString()); // Header에 리프레쉬 토큰 (Http Only)

        return ResponseEntity.ok(
                new TokenResDTO(token.accessToken(), "Bearer")
        );
    }


    @PostMapping("/refresh")
    @Operation(summary = "토큰 재발급")
    public ResponseEntity<TokenResDTO> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return ResponseEntity.status(401).build();
        }

        TokenPair token = authService.refresh(refreshToken);

        ResponseCookie cookie =
                CookieUtil.createRefreshCookie(token.refreshToken(), REFRESH_TIME);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(new TokenResDTO(token.accessToken(), "Bearer"));
    }


    @PostMapping("/logout")
    @Operation(summary = "로그아웃")
    public ResponseEntity<Void> logout(
            @CookieValue(value = "refreshToken", required = false) String refreshToken,
            HttpServletResponse response
    ) {
        if (refreshToken != null) {
            authService.logout(refreshToken);
        }

        ResponseCookie cookie = CookieUtil.deleteRefreshCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString()); // 쿠키 삭제

        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    @Operation(summary = "회원가입")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignUpReqDTO request) {
        authService.createUser(request);
        return ResponseEntity.ok().build();
    }

}