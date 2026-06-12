package com.heesik.backend.global.util;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

public class CookieUtil {

    public static ResponseCookie createRefreshCookie(String token, long maxAge) {
        boolean secure = isRequestSecure();
        String sameSite = secure ? "None" : "Lax";

        return ResponseCookie.from("refreshToken", token)
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(maxAge)
                .build();
    }

    // 쿠키 삭제 (덮어쓰기)
    public static ResponseCookie deleteRefreshCookie() {
        boolean secure = isRequestSecure();
        String sameSite = secure ? "None" : "Lax";

        return ResponseCookie.from("refreshToken", "")
                .httpOnly(true)
                .secure(secure)
                .sameSite(sameSite)
                .path("/")
                .maxAge(0)
                .build();
    }

    // HttpServletResponse에 직접 쿠키 삭제 헤더 추가
    public static void addDeleteCookie(HttpServletResponse response) {
        ResponseCookie cookie = deleteRefreshCookie();
        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());
    }

    private static boolean isRequestSecure() {
        RequestAttributes attributes = RequestContextHolder.getRequestAttributes();
        if (attributes instanceof ServletRequestAttributes) {
            HttpServletRequest request = ((ServletRequestAttributes) attributes).getRequest();
            return request.isSecure() || "https".equalsIgnoreCase(request.getHeader("X-Forwarded-Proto"));
        }
        return false;
    }

}
