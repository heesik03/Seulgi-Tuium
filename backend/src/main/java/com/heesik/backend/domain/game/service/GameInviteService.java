package com.heesik.backend.domain.game.service;

import com.heesik.backend.domain.game.converter.GameInviteConverter;
import com.heesik.backend.domain.game.dto.request.GameInviteReqDTO;
import com.heesik.backend.domain.game.dto.response.GameInviteResDTO;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameInviteService {

    // 기본 타임아웃 10분
    private static final Long DEFAULT_TIMEOUT = 60 * 10 * 1000L;

    // 사용자 ID별 SSE 연결 관리용 맵
    private final Map<Long, SseEmitter> emitters = new ConcurrentHashMap<>();
    private final UserRepository userRepository;
    private final GameRoomRepository gameRoomRepository;

    // SSE 구독 요청 처리
    public SseEmitter subscribe(Long userId) {
        SseEmitter emitter = new SseEmitter(DEFAULT_TIMEOUT);

        // 기존 커넥션이 남아있다면 강제 완료하여 정리 (메모리 누수 차단)
        SseEmitter oldEmitter = emitters.put(userId, emitter);
        if (oldEmitter != null) {
            try {
                oldEmitter.complete();
            } catch (Exception e) {
                log.warn("Failed to close old emitter for userId: {}", userId, e);
            }
        }

        // 정상 완료 시 제거
        emitter.onCompletion(() -> {
            log.info("SSE Connection completed for userId: {}", userId);
            emitters.remove(userId, emitter);
        });

        // 타임아웃 발생 시 제거
        emitter.onTimeout(() -> {
            log.warn("SSE Connection timeout for userId: {}", userId);
            emitter.complete();
            emitters.remove(userId, emitter);
        });

        // 에러 발생 시 제거
        emitter.onError((ex) -> {
            log.error("SSE Connection error for userId: {}, message: {}", userId, ex.getMessage());
            emitter.completeWithError(ex);
            emitters.remove(userId, emitter);
        });

        // 503 에러 방지용 첫 연결 더미 데이터 발송
        try {
            emitter.send(SseEmitter.event()
                    .name("connect")
                    .data("SSE Connection Established [userId: " + userId + "]"));
        } catch (Exception e) {
            log.error("Failed to send connection handshake to userId: {}", userId, e);
            emitter.completeWithError(e);
            emitters.remove(userId, emitter);
        }

        return emitter;
    }

    // 퀴즈방 초대 알림 발송
    public void sendInvite(Long senderId, GameInviteReqDTO reqDTO) {
        User sender = userRepository.findById(senderId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        User receiver = userRepository.findByName(reqDTO.receiverNickname())
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        Long receiverId = receiver.getId();
        SseEmitter receiverEmitter = emitters.get(receiverId);

        // 오프라인 유저면 전송 안 함 (에러 발생시켜 프론트엔드에 알림)
        if (receiverEmitter == null) {
            log.info("Receiver {} is currently offline. Skip sending notification.", receiverId);
            throw new com.heesik.backend.global.error.exception.GameException(com.heesik.backend.global.error.code.GameErrorCode.USER_OFFLINE);
        }

        // 메모리 기반 게임방에서 제목 조회 (삭제된 경우 대체 제목 사용)
        String roomTitle = gameRoomRepository.findRoom(reqDTO.roomId())
                .map(room -> room.getTitle())
                .orElse("방 " + reqDTO.roomId());

        GameInviteResDTO resDTO = GameInviteConverter.toResDTO(sender, reqDTO.roomId(), roomTitle);

        // 실시간 초대 전송
        try {
            receiverEmitter.send(SseEmitter.event()
                    .name("invite")
                    .data(resDTO));
            log.info("Successfully sent invite notification from {} to {}", senderId, receiverId);
        } catch (IOException e) {
            log.error("Failed to send invite notification to userId: {}", receiverId, e);
            receiverEmitter.completeWithError(e);
            emitters.remove(receiverId, receiverEmitter);
        }
    }
}

