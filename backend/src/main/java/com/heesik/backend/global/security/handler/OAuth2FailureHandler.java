package com.heesik.backend.global.security.handler;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.global.error.ErrorResDTO;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.authentication.AuthenticationFailureHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@RequiredArgsConstructor
@Slf4j
@Component
public class OAuth2FailureHandler implements AuthenticationFailureHandler {

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

        final String FRONT_URL = "http://localhost:5173";

        String redirectUrl = UriComponentsBuilder
                .fromUriString(FRONT_URL + "/login")
                .queryParam("error", "oauth2_failed")
                .build()
                .toUriString();

        response.sendRedirect(redirectUrl);
    }
}
