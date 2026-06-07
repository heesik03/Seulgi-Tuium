package com.heesik.backend.domain.game.controller;

import com.heesik.backend.domain.game.dto.request.GameInviteReqDTO;
import com.heesik.backend.domain.game.service.GameInviteService;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@Validated
@RestController
@RequestMapping("/api/game/invite")
@RequiredArgsConstructor
@Tag(name = "게임 초대 API", description = "SSE 기반 실시간 게임 초대 알림 API")
public class GameInviteController {

    private final GameInviteService gameInviteService;

    @GetMapping(value = "/connect", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    @Operation(summary = "실시간 초대 알림 SSE 연결 수립", description = "로그인된 사용자가 실시간 초대 알림을 수신하기 위해 SSE 커넥션을 맺습니다.")
    public ResponseEntity<SseEmitter> connectInvite(
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        
        SseEmitter emitter = gameInviteService.subscribe(userDetails.id());
        return ResponseEntity.ok(emitter);
    }

    @PostMapping
    @Operation(summary = "친구 초대 알림 발송", description = "다른 유저에게 특정 퀴즈방 참여 링크를 SSE 알림으로 전송합니다.")
    public ResponseEntity<Void> sendInviteNotification(
            @RequestBody @Valid GameInviteReqDTO reqDTO,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        gameInviteService.sendInvite(userDetails.id(), reqDTO);
        return ResponseEntity.noContent().build();
    }

}
