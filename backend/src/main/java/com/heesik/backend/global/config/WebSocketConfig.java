package com.heesik.backend.global.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.config.ChannelRegistration;

@Configuration
@EnableWebSocketMessageBroker
@RequiredArgsConstructor
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final GameAuthInterceptor gameAuthInterceptor;

    @Value("${cors.allowed-origins}")
    private String[] allowedOrigins;

    @Override
    public void configureClientInboundChannel(ChannelRegistration registration) {
        registration.interceptors(gameAuthInterceptor);
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry config) {
        // /topic : 1:N 브로드캐스팅 (채팅, 방 상태 변경 등)
        // /queue : 1:1 메시지 전달 (개별 귓속말, 특정 유저 에러 피드백 등)
        config.enableSimpleBroker("/topic", "/queue");
        
        // 클라이언트가 /app/game/message 로 전송하면 @MessageMapping 컨트롤러로 라우됨.
        config.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        // WebSocket Handshake를 위한 연결 엔드포인트 지정
        // CORS 허용
        registry.addEndpoint("/ws-quiz")
                .setAllowedOriginPatterns(allowedOrigins);
    }
}
