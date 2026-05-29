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

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException {

        final String FRONT_URL = "http://localhost:5173";

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
}