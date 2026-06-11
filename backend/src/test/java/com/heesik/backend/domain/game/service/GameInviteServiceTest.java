package com.heesik.backend.domain.game.service;

import com.heesik.backend.domain.game.dto.request.GameInviteReqDTO;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameInviteServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameRoomRepository gameRoomRepository;

    private GameInviteService gameInviteService;

    @BeforeEach
    void setUp() {
        gameInviteService = new GameInviteService(userRepository, gameRoomRepository);
    }

    @Test
    @DisplayName("구독 시 SseEmitter가 정상 생성되어 연결 수립을 수행한다")
    void subscribe_success() {
        // when
        SseEmitter emitter = gameInviteService.subscribe(1L);

        // then
        assertNotNull(emitter);
    }

    @Test
    @DisplayName("온라인 유저에게 초대 발송 시 DB 조회 후 알림 전송을 찌른다")
    void sendInvite_onlineUser_success() {
        // given
        User sender = User.builder()
                .email("sender@test.com")
                .name("Alice")
                .build();
        
        // 리플렉션을 이용해 User의 private ID 필드 강제 주입
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(sender, 1L);
        } catch (Exception e) {
            org.junit.jupiter.api.Assertions.fail(e.getMessage());
        }

        when(userRepository.findById(1L)).thenReturn(Optional.of(sender));

        User receiver = User.builder()
                .email("receiver@test.com")
                .name("Bob")
                .build();
        try {
            java.lang.reflect.Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(receiver, 2L);
        } catch (Exception e) {
            org.junit.jupiter.api.Assertions.fail(e.getMessage());
        }
        when(userRepository.findByName("Bob")).thenReturn(Optional.of(receiver));
        
        // 수신자 세션 활성화 (구독)
        gameInviteService.subscribe(2L);

        GameInviteReqDTO reqDTO = new GameInviteReqDTO("Bob", 10L);

        // when
        gameInviteService.sendInvite(1L, reqDTO);

        // then
        verify(userRepository, times(1)).findById(1L);
        verify(userRepository, times(1)).findByName("Bob");
    }

    @Test
    @DisplayName("재연결 후 이전 emitter 예외 발생 시 최신 emitter가 맵에서 제거되지 않고 유지된다")
    @SuppressWarnings("unchecked")
    void sendInvite_reconnect_oldEmitterException_keepsNewEmitter() throws Exception {
        // 1. 구 버전 Emitter 연결
        SseEmitter oldBobEmitter = gameInviteService.subscribe(2L);

        // 2. Bob이 새로운 커넥션을 맺음
        SseEmitter newBobEmitter = gameInviteService.subscribe(2L);

        // 3. 내부 emitters 맵을 리플렉션으로 확인
        java.lang.reflect.Field emittersField = GameInviteService.class.getDeclaredField("emitters");
        emittersField.setAccessible(true);
        java.util.Map<Long, SseEmitter> emitters = (java.util.Map<Long, SseEmitter>) emittersField.get(gameInviteService);
        
        // 맵에는 newBobEmitter가 존재해야 함
        org.junit.jupiter.api.Assertions.assertSame(newBobEmitter, emitters.get(2L));

        // 4. 구 버전 Emitter에 대한 예외 제거 시도 (emitters.remove(2L, oldBobEmitter))
        emitters.remove(2L, oldBobEmitter);

        // then: newBobEmitter가 맵에 그대로 살아있어야 함
        org.junit.jupiter.api.Assertions.assertSame(newBobEmitter, emitters.get(2L));
    }
}
