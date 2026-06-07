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

    // 퀴즈방 조회 및 신규 생성
    public GameRoom findOrCreateRoom(Long roomId) {
        return rooms.computeIfAbsent(roomId, GameRoom::new);
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
