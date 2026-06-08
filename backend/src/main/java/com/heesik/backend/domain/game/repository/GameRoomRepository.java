package com.heesik.backend.domain.game.repository;

import com.heesik.backend.domain.game.model.GameRoom;
import org.springframework.stereotype.Repository;

import java.util.Map;
import java.util.Optional;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class GameRoomRepository {

    // 동시성 제어가 보장되는 메모리 기반 퀴즈방 저장소
    private final Map<Long, GameRoom> rooms = new ConcurrentHashMap<>();

    // 퀴즈방 생성 (방장 개설 시)
    public GameRoom findOrCreateRoom(Long roomId, String title) {
        return rooms.computeIfAbsent(roomId, k -> new GameRoom(k, title));
    }

    // 퀴즈방 조회 및 신규 생성 (웹소켓 통신 중 누락된 방 복구용 등)
    public GameRoom findOrCreateRoom(Long roomId) {
        return rooms.computeIfAbsent(roomId, k -> new GameRoom(k, "방 " + k));
    }

    // 퀴즈방 조회
    public Optional<GameRoom> findRoom(Long roomId) {
        return Optional.ofNullable(rooms.get(roomId));
    }

    // 빈 방 파기 처리
    public void deleteRoom(Long roomId) {
        rooms.remove(roomId);
    }
}
