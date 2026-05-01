package com.heesik.backend.global.util;


import org.springframework.http.ResponseCookie;

public class CookieUtil {

    // 리프레쉬 쿠키 생성
    public static ResponseCookie createRefreshCookie(String token, long maxAge) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true) // JS 접근 차단 (XSS 방어)
                .secure(true)   // HTTPS only
                .sameSite("None")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    // 쿠키 삭제 (덮어쓰기)
    public static ResponseCookie deleteRefreshCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .build();
    }

}
