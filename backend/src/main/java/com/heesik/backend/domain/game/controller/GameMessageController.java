package com.heesik.backend.domain.game.controller;

import com.heesik.backend.domain.game.converter.GameRoomConverter;
import com.heesik.backend.domain.game.converter.GameStartConverter;
import com.heesik.backend.domain.game.converter.GameQuizConverter;
import com.heesik.backend.domain.game.dto.request.GameMessageReqDTO;
import com.heesik.backend.domain.game.dto.response.GameMessageResDTO;
import com.heesik.backend.domain.game.dto.response.GameRoomStatusResDTO;
import com.heesik.backend.domain.game.dto.response.GameStartResDTO;
import com.heesik.backend.domain.game.dto.response.GameQuestionResDTO;
import com.heesik.backend.domain.game.dto.response.GameSubmitResDTO;
import com.heesik.backend.domain.game.enums.GameMessageType;
import com.heesik.backend.domain.game.model.GameRoom;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import com.heesik.backend.domain.game.service.GameMessageService;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.GameException;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.security.entity.CustomUserDetails;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.MessageExceptionHandler;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.messaging.simp.annotation.SendToUser;
import org.springframework.stereotype.Controller;
import org.springframework.stereotype.Controller;

@Slf4j
@Controller
@RequiredArgsConstructor
@Tag(name = "게임방 실시간 메시지 API", description = "WebSocket STOMP 기반 게임방 입장, 퇴장 및 일반 채팅 처리 API")
public class GameMessageController {

    private final SimpMessagingTemplate messagingTemplate;
    private final GameMessageService gameMessageService;
    private final GameRoomRepository gameRoomRepository;

    @MessageMapping("/game/message")
    @Operation(
            summary = "게임방 메시지 송수신 및 상태 연동",
            description = "입장, 퇴장, 일반 채팅, 준비 상태, 시작, 정답 제출을 수신하여 이벤트를 브로드캐스팅합니다."
    )
    public void handleGameMessage(
            @Valid GameMessageReqDTO reqDTO,
            SimpMessageHeaderAccessor headerAccessor) {
        
        Long userId = (Long) headerAccessor.getSessionAttributes().get("userId");
        String userName = (String) headerAccessor.getSessionAttributes().get("name");

        // 웹소켓 비정상 세션 종료 시 퇴장 처리를 위한 roomId 세션 저장
        if (reqDTO.type() == GameMessageType.ENTER) {
            headerAccessor.getSessionAttributes().put("roomId", reqDTO.roomId());
        } else if (reqDTO.type() == GameMessageType.LEAVE) {
            headerAccessor.getSessionAttributes().remove("roomId");
        }

        // 1. 비즈니스 로직 및 시스템/채팅 메시지 처리
        GameMessageResDTO resDTO = gameMessageService.processGameMessage(reqDTO, userId, userName);

        // 2. 가공된 일반/시스템 메시지 전송 (Destination: /topic/room/{roomId})
        messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId(), resDTO);

        // 3. 퀴즈 시작(START) 시에는 퀴즈 시작 및 문제 출제 신호 발행
        if (reqDTO.type() == GameMessageType.START) {
            gameRoomRepository.findRoom(reqDTO.roomId()).ifPresent(room -> {
                GameStartResDTO startResDTO = GameStartConverter.toResDTO(room, resDTO.message());
                // 시작 신호 전송
                messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/start", startResDTO);

                // 문제 출제 정보 전송
                GameQuestionResDTO questionResDTO = GameQuizConverter.toQuestionResDTO(room);
                log.info("Broadcasting quiz question for room [{}]", reqDTO.roomId());
                messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/question", questionResDTO);
            });
            return;
        }

        // 4. 정답 제출(SUBMIT) 시 정답 피드백 및 스코어판 갱신 이벤트 발행
        if (reqDTO.type() == GameMessageType.SUBMIT) {
            gameRoomRepository.findRoom(reqDTO.roomId()).ifPresent(room -> {
                // 서비스에서 판단하여 돌려준 정오 여부를 DTO에 반영 (시간 초과 오동작 원천 차단)
                Boolean isCorrect = resDTO.isCorrect() != null && resDTO.isCorrect();
                
                GameSubmitResDTO submitResDTO = GameQuizConverter.toSubmitResDTO(room, userId, userName, reqDTO.message(), isCorrect);
                log.info("Broadcasting submit result for user [{}] in room [{}]", userName, reqDTO.roomId());
                messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/submit", submitResDTO);

                // 1등 정답을 맞춘 시점에 진행 여부에 따라 다음 문제 혹은 종료 전달
                if (isCorrect) {
                    if (room.getIsStarted()) {
                        // 다음 문제 출제 정보 전송
                        GameQuestionResDTO questionResDTO = GameQuizConverter.toQuestionResDTO(room);
                        log.info("Broadcasting next quiz question for room [{}]", reqDTO.roomId());
                        messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/question", questionResDTO);
                    } else {
                        // 모든 라운드 종료로 게임 최종 종료 전달 및 참가자 목록 동기화
                        String endMsg = "게임이 종료되었습니다! 최종 결과 스코어가 대기방에 반영되었습니다.";
                        messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/start", GameStartConverter.toResDTO(room, endMsg));
                        
                        GameRoomStatusResDTO statusResDTO = GameRoomConverter.toRoomStatusResDTO(room);
                        messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/status", statusResDTO);
                    }
                }
            });
            return;
        }

        // 5. 입장(ENTER), 퇴장(LEAVE), 준비(READY), 위임(DELEGATE), 종료(END) 시 방 참가자 리스트 동기화
        if (reqDTO.type() != GameMessageType.TALK) {
            gameRoomRepository.findRoom(reqDTO.roomId()).ifPresent(room -> {
                GameRoomStatusResDTO statusResDTO = GameRoomConverter.toRoomStatusResDTO(room);
                messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/status", statusResDTO);
            });
        }
    }

    // 웹소켓의 에러를 캐치
    @MessageExceptionHandler(GameException.class)
    @SendToUser("/queue/errors")
    public String handleGameException(GameException ex) {
        log.warn("Caught validation error in WebSocket handler: {}", ex.getMessage());
        return "ERROR: " + ex.getErrorCode().getMessage();
    }

}
