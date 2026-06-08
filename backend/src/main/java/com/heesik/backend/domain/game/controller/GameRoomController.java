package com.heesik.backend.domain.game.controller;

import com.heesik.backend.domain.game.dto.request.GameRoomReqDTO;
import com.heesik.backend.domain.game.dto.response.GameRoomResDTO;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.concurrent.atomic.AtomicLong;

@RestController
@RequestMapping("/api/game/rooms")
@RequiredArgsConstructor
@Tag(name = "게임방 REST API", description = "게임방 생성 및 관리를 위한 API")
public class GameRoomController {

    private final GameRoomRepository gameRoomRepository;
    private static final AtomicLong roomIdGenerator = new AtomicLong(1);

    @PostMapping
    @Operation(summary = "퀴즈 방 생성", description = "새로운 실시간 퀴즈 방을 생성하고 roomId를 반환합니다.")
    public ResponseEntity<GameRoomResDTO> createRoom(@RequestBody @Valid GameRoomReqDTO reqDTO) {
        Long newRoomId = roomIdGenerator.getAndIncrement();
        
        // 메모리에 방 생성 등록
        gameRoomRepository.findOrCreateRoom(newRoomId, reqDTO.title());

        GameRoomResDTO resDTO = new GameRoomResDTO(newRoomId, reqDTO.title());
        return ResponseEntity.ok(resDTO);
    }
}
