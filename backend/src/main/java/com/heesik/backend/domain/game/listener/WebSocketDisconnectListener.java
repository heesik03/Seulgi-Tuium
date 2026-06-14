package com.heesik.backend.domain.game.listener;

import com.heesik.backend.domain.game.repository.GameRoomRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketDisconnectListener {

    private final GameRoomRepository gameRoomRepository;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        SimpMessageHeaderAccessor accessor = SimpMessageHeaderAccessor.wrap(event.getMessage());

        if (accessor.getSessionAttributes() != null) {
            final Long userId = (Long) accessor.getSessionAttributes().get("userId");
            final Long roomId = (Long) accessor.getSessionAttributes().get("roomId");

            if (userId != null && roomId != null) {
                gameRoomRepository.findRoom(roomId).ifPresent(room -> {
                    log.warn("User [{}] disconnected abnormally. Forcing leave from room [{}].", userId, roomId);
                    room.leave(userId);

                    // 마지막 유저 퇴장 시 메모리 클린업 보장
                    if (room.getParticipants().isEmpty()) {
                        gameRoomRepository.deleteRoom(roomId);
                        log.info("In-memory GameRoom [{}] safely cleaned up.", roomId);
                    }
                });
            }
        }
    }
}
