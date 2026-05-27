package com.heesik.backend.domain.user.controller;

import com.heesik.backend.domain.user.converter.UserConverter;
import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.dto.response.TokenResDTO;
import com.heesik.backend.domain.user.service.AuthService;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
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
@Tag(name = "사용자 인증 API", description = "로그인, 로그아웃, 회원가입 등을 관리하는 인증 API (로그인 불필요)")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "로그인")
    public ResponseEntity<TokenResDTO> login(
            @Valid @RequestBody LoginReqDTO request,
            HttpServletResponse response
    ) {
        TokenPair token = authService.login(request);
        ResponseCookie cookie =
                CookieUtil.createRefreshCookie(token.refreshToken(), authService.getRefreshTimeInSeconds());

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString()); // Header에 리프레쉬 토큰 (Http Only)
        return ResponseEntity.ok(
                UserConverter.toTokenResDTO(token.accessToken(), "Bearer")
        );
    }

    @PostMapping("/refresh")
    @Operation(summary = "토큰 재발급")
    public ResponseEntity<TokenResDTO> refresh(
            @CookieValue(value = "refreshToken", required = false) String refreshToken
    ) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new UserException(UserErrorCode.INVALID_REFRESH_TOKEN);
        }
        TokenPair token = authService.refresh(refreshToken);
        ResponseCookie cookie = CookieUtil.createRefreshCookie(token.refreshToken(), authService.getRefreshTimeInSeconds());

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(UserConverter.toTokenResDTO(token.accessToken(), "Bearer"));
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
        CookieUtil.addDeleteCookie(response);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/signup")
    @Operation(summary = "회원가입")
    public ResponseEntity<Void> signup(@Valid @RequestBody SignUpReqDTO request) {
        authService.createUser(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/name/{name}")
    @Operation(summary = "이름 중복 체크", description = "true면 사용 가능한 이름, false면 이미 있는 이름이다.")
    public ResponseEntity<Boolean> checkEmailAvailability(@PathVariable String name) {
        return ResponseEntity.ok(!authService.isNameDuplicated(name));
    }

    @GetMapping("/email/{email}")
    @Operation(summary = "이메일 중복 체크", description = "true면 사용 가능한 이메일, false면 이미 있는 이메일이다.")
    public ResponseEntity<Boolean> checkNameAvailability(@PathVariable String email) {
        return ResponseEntity.ok(!authService.isEmailDuplicated(email));
    }

}