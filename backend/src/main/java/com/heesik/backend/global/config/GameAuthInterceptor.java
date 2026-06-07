package com.heesik.backend.global.config;

import com.heesik.backend.global.security.service.JwtProvider;
import io.jsonwebtoken.Claims;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

import java.util.HashMap;

@Component
@RequiredArgsConstructor
public class GameAuthInterceptor implements ChannelInterceptor {

    private final JwtProvider jwtProvider;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // WebSocket Handshake 시점에 넘어온 Bearer JWT 토큰 강제 추출
            String authHeader = accessor.getFirstNativeHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtProvider.validateToken(token)) {
                    Claims claims = jwtProvider.getClaims(token);
                    Long userId = claims.get("id", Long.class);
                    String name = claims.get("name", String.class);

                    if (accessor.getSessionAttributes() == null) {
                        accessor.setSessionAttributes(new HashMap<>());
                    }
                    // 세션 내부 컨텍스트에 검증 완료된 사용자 정보 바인딩 (컨트롤러에서 DB 조회 없이 사용 가능)
                    accessor.getSessionAttributes().put("userId", userId);
                    accessor.getSessionAttributes().put("name", name);
                }
            }
        }
        return message;
    }
}
