package com.heesik.backend.global.security.filter;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.global.error.ErrorResDTO;
import com.heesik.backend.global.error.code.BaseErrorCode;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.BaseException;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.security.service.JwtProvider;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import com.heesik.backend.global.security.enums.TokenType;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtProvider jwtProvider;
    private final ObjectMapper objectMapper;

    @Override
    protected boolean shouldNotFilter(@NonNull HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/auth/") || 
               path.startsWith("/oauth2/") || 
               path.startsWith("/login/oauth2/");
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        String token = resolveToken(request); // Authorization 헤더에서 토큰 추출

        // 토큰이 없으면 다음 필터로 통과
        if (token == null) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            // 토큰에서 데이터 추출
            Claims claims = jwtProvider.getClaims(token);

            // ACCESS 토큰만 인증 처리
            if (jwtProvider.getTokenType(claims) != TokenType.ACCESS) {
                filterChain.doFilter(request, response);
                return;
            }

            String email = claims.getSubject();
            String name = claims.get("name", String.class);
            String role = claims.get("role", String.class);
            Long userId = getUserId(claims);

            // CustomUserDetails 객체 생성
            CustomUserDetails principal =
                    new CustomUserDetails(userId, email, name, role, false);

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(
                            principal,
                            null,
                            principal.getAuthorities()
                    );

            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

            // SecurityContext에 인증 정보 저장
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (Exception e) {
            log.error("JWT Security Context 처리 중 오류 발생", e);
            SecurityContextHolder.clearContext();

            BaseErrorCode errorCode = (e instanceof BaseException baseException)
                    ? baseException.getErrorCode()
                    : UserErrorCode.INVALID_JWT_TOKEN;

            sendErrorResponse(response, errorCode);
            return;
        }

        filterChain.doFilter(request, response); // 다음 필터 진행
    }


    private String resolveToken(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }


    private Long getUserId(Claims claims) {
        Object id = claims.get("id");
        if (id instanceof Number number) {
            return number.longValue();
        }
        if (id instanceof String value && StringUtils.hasText(value)) {
            return Long.parseLong(value);
        }
        throw new UserException(UserErrorCode.INVALID_JWT_TOKEN);
    }

    private void sendErrorResponse(HttpServletResponse response, BaseErrorCode errorCode) throws IOException {
        response.setStatus(errorCode.getStatus().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");

        ErrorResDTO errorResponse = ErrorResDTO.builder()
                .errorCode(errorCode.getCode())
                .message(errorCode.getMessage())
                .build();

        String json = objectMapper.writeValueAsString(errorResponse);
        response.getWriter().write(json);
    }

}
