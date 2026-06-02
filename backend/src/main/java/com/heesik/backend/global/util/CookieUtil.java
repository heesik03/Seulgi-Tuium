package com.heesik.backend.global.util;


import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;

public class CookieUtil {

    public static ResponseCookie createRefreshCookie(String token, long maxAge) {
        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    // 쿠키 삭제 (덮어쓰기)
    public static ResponseCookie deleteRefreshCookie() {
        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/")
                .maxAge(0)
                .build();
    }

    // HttpServletResponse에 직접 쿠키 삭제 헤더 추가
    public static void addDeleteCookie(HttpServletResponse response) {
        ResponseCookie cookie = deleteRefreshCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

}
