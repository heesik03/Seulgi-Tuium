package com.heesik.backend.global.security.handler;

import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.service.token.TokenService;
import com.heesik.backend.global.security.entity.CustomOAuth2User;
import com.heesik.backend.global.util.CookieUtil;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final TokenService tokenService;

    @org.springframework.beans.factory.annotation.Value("${cors.allowed-origins}")
    private String allowedOrigins;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        final String FRONT_URL = determineFrontUrl(request);

        CustomOAuth2User principal =
                (CustomOAuth2User) authentication.getPrincipal();

        TokenPair token =
                tokenService.loginOAuth(principal.getUserId());

        ResponseCookie cookie = CookieUtil.createRefreshCookie(
                        token.refreshToken(),
                        tokenService.getRefreshTimeInSeconds()
                );

        response.addHeader(HttpHeaders.SET_COOKIE, cookie.toString());

        String redirectUrl = UriComponentsBuilder
                .fromUriString(FRONT_URL)
                .queryParam("accessToken", token.accessToken())
                .build()
                .toUriString();

        getRedirectStrategy().sendRedirect(
                request,
                response,
                redirectUrl
        );
    }

    private String determineFrontUrl(HttpServletRequest request) {
        if (allowedOrigins == null || allowedOrigins.isBlank()) {
            throw new IllegalStateException("CORS allowed-origins configuration is missing or empty.");
        }

        java.util.List<String> origins = java.util.List.of(allowedOrigins.split(","));

        String referer = request.getHeader("Referer");
        String origin = request.getHeader("Origin");

        for (String allowed : origins) {
            String trimmed = allowed.trim();
            if (origin != null && origin.startsWith(trimmed)) {
                return trimmed;
            }
            if (referer != null && referer.startsWith(trimmed)) {
                return trimmed;
            }
        }

        String serverName = request.getServerName();
        boolean isLocal = "localhost".equals(serverName) || "127.0.0.1".equals(serverName);

        if (isLocal) {
            return origins.stream()
                    .map(String::trim)
                    .filter(o -> o.contains("localhost") || o.contains("127.0.0.1"))
                    .findFirst()
                    .orElse(origins.get(0).trim());
        } else {
            return origins.stream()
                    .map(String::trim)
                    .filter(o -> !o.contains("localhost") && !o.contains("127.0.0.1"))
                    .findFirst()
                    .orElse(origins.get(0).trim());
        }
    }
}