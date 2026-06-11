package com.heesik.backend.global.security.handler;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

    @Value("${cors.allowed-origins}")
    private List<String> allowedOrigins;

    @Override
    public void onAuthenticationFailure(
            HttpServletRequest request,
            HttpServletResponse response,
            AuthenticationException exception
    ) throws IOException {

        log.error(
                "OAuth2 Login Failed. uri={}, message={}",
                request.getRequestURI(),
                exception.getMessage(),
                exception
        );

        final String FRONT_URL = determineFrontUrl(request);

        String redirectUrl = UriComponentsBuilder
                .fromUriString(FRONT_URL + "/login")
                .queryParam("error", "oauth2_failed")
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }

    private String determineFrontUrl(HttpServletRequest request) {
        if (allowedOrigins == null || allowedOrigins.isEmpty()) {
            throw new IllegalStateException("CORS allowed-origins configuration is missing or empty.");
        }

        String referer = request.getHeader("Referer");
        String origin = request.getHeader("Origin");

        for (String allowed : allowedOrigins) {
            if (origin != null && origin.startsWith(allowed)) {
                return allowed;
            }
            if (referer != null && referer.startsWith(allowed)) {
                return allowed;
            }
        }

        String serverName = request.getServerName();
        boolean isLocal = "localhost".equals(serverName) || "127.0.0.1".equals(serverName);

        if (isLocal) {
            return allowedOrigins.stream()
                    .filter(o -> o.contains("localhost") || o.contains("127.0.0.1"))
                    .findFirst()
                    .orElse(allowedOrigins.get(0));
        } else {
            return allowedOrigins.stream()
                    .filter(o -> !o.contains("localhost") && !o.contains("127.0.0.1"))
                    .findFirst()
                    .orElse(allowedOrigins.get(0));
        }
    }
}
