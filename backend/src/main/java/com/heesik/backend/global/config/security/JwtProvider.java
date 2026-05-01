package com.heesik.backend.global.config.security;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Slf4j
@Component
public class JwtProvider {

    @Value("${JWT_KEY}")
    private String jwtKey;

    @Value("${JWT_ISSUER}")
    private String jwtIssuer;

    private SecretKey secretKey;

    @PostConstruct
    protected void init() {
        // 보안을 위해 SecretKey 객체로 변환 (HMAC-SHA 알고리즘용)
        this.secretKey = Keys.hmacShaKeyFor(jwtKey.getBytes(StandardCharsets.UTF_8));
    }

    // 토큰 생성
    public String createToken(User user, long expirationMs) {
        return Jwts.builder()
                .header()
                .add("typ","JWT")
                .and()
                .subject(user.getEmail())
                .issuer(jwtIssuer)        // 발급자
                .issuedAt(new Date())   // 발급 시간
                .expiration(new Date(System.currentTimeMillis() + expirationMs)) // 만료 시간 설정
                .claim("id", user.getId()) // 발급 유저의 id
                .claim("role", user.getRole()) // 발급 유저의 권한
                .signWith(secretKey)          // 서명
                .compact();
    }

    // claim 추출 및 유효성 검증
    public Claims getClaims(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(secretKey)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

        } catch (SecurityException | MalformedJwtException e) {
            throw new UserException(UserErrorCode.INVALID_JWT_SIGNATURE); // 잘못된 JWT 서명
        } catch (ExpiredJwtException e) {
            throw new UserException(UserErrorCode.EXPIRED_JWT_TOKEN); // 만료된 JWT 토큰
        } catch (UnsupportedJwtException e) {
            throw new UserException(UserErrorCode.UNSUPPORTED_JWT_TOKEN); // 지원되지 않는 JWT 토큰
        } catch (IllegalArgumentException e) {
            throw new UserException(UserErrorCode.EMPTY_JWT_CLAIM); // JWT 토큰이 비어있음
        }
    }

    // 토큰에서 id 추출
    public Long getUserId(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.get("id", Long.class) : null;
    }

    // 토큰에서 email 추출
    public String getEmail(String token) {
        Claims claims = getClaims(token);
        return claims != null ? claims.getSubject() : null;
    }

    // 유효성 검증
    public boolean validateToken(String token) {
        return getClaims(token) != null;
    }

}
