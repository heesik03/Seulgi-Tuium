package com.heesik.backend.domain.game.service;

import com.heesik.backend.domain.game.converter.GameMessageConverter;
import com.heesik.backend.domain.game.converter.GameRoomConverter;
import com.heesik.backend.domain.game.converter.GameQuizConverter;
import com.heesik.backend.domain.game.converter.GameStartConverter;
import com.heesik.backend.domain.game.dto.request.GameMessageReqDTO;
import com.heesik.backend.domain.game.dto.response.GameMessageResDTO;
import com.heesik.backend.domain.game.dto.response.GameQuestionResDTO;
import com.heesik.backend.domain.game.enums.GameMessageType;
import com.heesik.backend.domain.game.model.GameRoom;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import com.heesik.backend.domain.game.repository.RedisLockRepository;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.GameErrorCode;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.GameException;
import com.heesik.backend.global.error.exception.UserException;
import jakarta.annotation.PreDestroy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.ScheduledFuture;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class GameMessageService {

    private final UserRepository userRepository;
    private final GameRoomRepository gameRoomRepository;
    private final RedisLockRepository redisLockRepository;
    private final WordRepository wordRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private final ScheduledExecutorService scheduler = Executors.newScheduledThreadPool(4);
    private final Map<Long, ScheduledFuture<?>> timeoutTasks = new ConcurrentHashMap<>();

    @PreDestroy
    public void shutdown() {
        scheduler.shutdown();
        log.info("Game timeout scheduler shutdown completed.");
    }

    // 참가자 행동 처리 및 대화 메시지 생성
    public GameMessageResDTO processGameMessage(GameMessageReqDTO reqDTO, Long userId, String userName) {
        // 퀴즈방 조회 없으면 자동 생성
        GameRoom room = gameRoomRepository.findOrCreateRoom(reqDTO.roomId());

        // 입장 처리
        if (reqDTO.type() == GameMessageType.ENTER) {
            room.join(userId, userName);
            String enterMessage = userName + "님이 퀴즈방에 입장하셨습니다.";
            return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, enterMessage, GameMessageType.ENTER);
        }

        // 퇴장 처리
        if (reqDTO.type() == GameMessageType.LEAVE) {
            room.leave(userId);
            
            // 빈 방이면 메모리 삭제 및 타임아웃 제거
            if (room.getParticipants().isEmpty()) {
                cancelTimeout(reqDTO.roomId());
                gameRoomRepository.deleteRoom(reqDTO.roomId());
                log.info("In-memory GameRoom [{}] deleted due to empty participants.", reqDTO.roomId());
            }
            
            String leaveMessage = userName + "님이 퀴즈방에서 퇴장하셨습니다.";
            return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, leaveMessage, GameMessageType.LEAVE);
        }

        // 준비 토글
        if (reqDTO.type() == GameMessageType.READY) {
            room.toggleReady(userId);
            String readyMessage = userName + "님이 준비 상태를 변경했습니다.";
            return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, readyMessage, GameMessageType.READY);
        }

        // 퀴즈 시작 (첫 문제 출제 및 선착순 락 리셋)
        if (reqDTO.type() == GameMessageType.START) {
            String lockValue = userId.toString();
            Boolean acquired = redisLockRepository.lock(reqDTO.roomId(), lockValue);
            if (acquired == null || !acquired) {
                log.warn("Failed to acquire lock for starting room [{}]. Request blocked.", reqDTO.roomId());
                throw new GameException(GameErrorCode.GAME_ALREADY_STARTED);
            }

            try {
                // Word Entity 에서 랜덤 4개 추출
                List<Word> words = wordRepository.findRandomWordsLimit4();
                if (words.size() < 4) {
                    log.error("Insufficient words in database. Found only [{}] words.", words.size());
                    throw new GameException(GameErrorCode.INSUFFICIENT_WORDS);
                }

                room.startQuiz(userId, words);
                // 선착순 정답 락 강제 해제 (리셋)
                redisLockRepository.unlockAnswer(reqDTO.roomId());
                
                // 첫 라운드 타임아웃 예약 등록 (10초)
                scheduleTimeout(reqDTO.roomId(), 0, 10L);

                String startMessage = "방장이 게임을 시작했습니다. 첫 번째 문제가 출제되었습니다!";
                return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, startMessage, GameMessageType.START);
            } finally {
                redisLockRepository.unlock(reqDTO.roomId(), lockValue);
            }
        }

        // 방장 수동 위임
        if (reqDTO.type() == GameMessageType.DELEGATE) {
            if (reqDTO.targetUserId() == null) {
                throw new GameException(GameErrorCode.GAME_ROOM_NOT_FOUND);
            }

            String lockValue = userId.toString();
            Boolean acquired = redisLockRepository.lock(reqDTO.roomId(), lockValue);
            if (acquired == null || !acquired) {
                log.warn("Failed to acquire lock for delegating room [{}]. Request blocked.", reqDTO.roomId());
                throw new GameException(GameErrorCode.GAME_ALREADY_STARTED);
            }

            try {
                User targetUser = userRepository.findById(reqDTO.targetUserId())
                        .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));
                
                room.delegateHost(userId, targetUser.getId());
                String delegateMessage = userName + "님이 " + targetUser.getName() + "님에게 방장을 위임했습니다.";
                return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, delegateMessage, GameMessageType.DELEGATE);
            } finally {
                redisLockRepository.unlock(reqDTO.roomId(), lockValue);
            }
        }

        // 퀴즈 강제 종료
        if (reqDTO.type() == GameMessageType.END) {
            String lockValue = userId.toString();
            Boolean acquired = redisLockRepository.lock(reqDTO.roomId(), lockValue);
            if (acquired == null || !acquired) {
                log.warn("Failed to acquire lock for ending room [{}]. Request blocked.", reqDTO.roomId());
                throw new GameException(GameErrorCode.GAME_ALREADY_STARTED);
            }

            try {
                cancelTimeout(reqDTO.roomId());
                room.endQuiz(userId);
                // 선착순 락 강제 해제
                redisLockRepository.unlockAnswer(reqDTO.roomId());
                
                String endMessage = "방장이 게임을 종료했습니다. 대기 상태로 복귀합니다.";
                return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, endMessage, GameMessageType.END);
            } finally {
                redisLockRepository.unlock(reqDTO.roomId(), lockValue);
            }
        }

        // 정답 제출 (Redis Lock을 연계해 선착순 1인만 정답 판정 보장)
        if (reqDTO.type() == GameMessageType.SUBMIT) {
            // 1차 텍스트 일치 여부 체크
            String correctWord = room.getCurrentWord();
            String submittedText = reqDTO.message().trim();
            
            if (correctWord == null || !correctWord.equalsIgnoreCase(submittedText)) {
                // 단순 오답 처리
                String feedbackMessage = userName + "님이 제출한 [" + reqDTO.message() + "]은 오답입니다.";
                return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, feedbackMessage, GameMessageType.SUBMIT, false);
            }

            // 정답을 맞춘 경우, 선착순 1등 락 획득 시도
            Boolean firstSolved = redisLockRepository.lockAnswer(reqDTO.roomId());
            if (firstSolved != null && firstSolved) {
                // 1등인 경우 채점 및 누적 스코어 반영 (만료 시간 최종 검증)
                Boolean isSuccess = room.submitAnswer(userId, reqDTO.message());
                
                if (isSuccess != null && isSuccess) {
                    // 타이머 취소
                    cancelTimeout(reqDTO.roomId());
                    
                    String feedbackMessage = userName + "님이 1등으로 정답 [" + reqDTO.message() + "]을 맞추셨습니다! (+10점)";
                    
                    boolean hasNext = room.moveToNextRound();
                    redisLockRepository.unlockAnswer(reqDTO.roomId()); // 1등 락 리셋

                    if (hasNext) {
                        // 다음 문제 스케줄링 등록 (프론트 3초 딜레이 감안해 13초 타임아웃)
                        scheduleTimeout(reqDTO.roomId(), room.getCurrentRound(), 13L);
                    } else {
                        // 마지막 문제 정답 시 프론트에서 피드백(3초)을 볼 수 있도록 3초 후 게임 완전 종료 처리
                        scheduler.schedule(() -> {
                            room.endQuizDirect();
                            String endMsg = "게임이 종료되었습니다! 최종 결과 스코어가 대기방에 반영되었습니다.";
                            messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/start", 
                                GameStartConverter.toResDTO(room, endMsg));
                            messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId(), 
                                GameMessageConverter.toSystemResDTO(reqDTO.roomId(), null, "SYSTEM", endMsg, GameMessageType.END));
                            messagingTemplate.convertAndSend("/topic/room/" + reqDTO.roomId() + "/status", 
                                GameRoomConverter.toRoomStatusResDTO(room));
                        }, 3, TimeUnit.SECONDS);
                    }

                    return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, feedbackMessage, GameMessageType.SUBMIT, true);
                } else {
                    // 락은 얻었으나 이미 타임아웃 등으로 문제가 만료된 상황
                    redisLockRepository.unlockAnswer(reqDTO.roomId());
                    String feedbackMessage = userName + "님이 정답 [" + reqDTO.message() + "]을 맞췄으나 이미 만료되었습니다.";
                    return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, feedbackMessage, GameMessageType.SUBMIT, false);
                }
            }

            // 정답을 입력했으나 이미 1등 락이 잠긴 경우 (아까운 선착순 탈락)
            String feedbackMessage = userName + "님이 정답 [" + reqDTO.message() + "]을 맞췄으나, 아쉽게도 2등입니다!";
            return GameMessageConverter.toSystemResDTO(reqDTO.roomId(), userId, userName, feedbackMessage, GameMessageType.SUBMIT, false);
        }

        // 일반 채팅
        return GameMessageConverter.toResDTO(reqDTO, userId, userName);
    }

    // 10초 타임아웃 예약 등록 장치 (라운드별 동적 시간 적용)
    private void scheduleTimeout(Long roomId, int round, long delaySeconds) {
        cancelTimeout(roomId);

        ScheduledFuture<?> future = scheduler.schedule(() -> {
            handleTimeout(roomId, round);
        }, delaySeconds, TimeUnit.SECONDS);

        timeoutTasks.put(roomId, future);
        log.info("Scheduled timeout task for room [{}] round [{}] with delay [{}]", roomId, round, delaySeconds);
    }

    // 타임아웃 취소
    private void cancelTimeout(Long roomId) {
        ScheduledFuture<?> future = timeoutTasks.remove(roomId);
        if (future != null) {
            future.cancel(false);
            log.info("Cancelled timeout task for room [{}]", roomId);
        }
    }

    // 타임아웃 핸들러
    private void handleTimeout(Long roomId, int round) {
        gameRoomRepository.findRoom(roomId).ifPresent(room -> {
            room.getLock().lock();
            try {
                if (room.getIsStarted() && room.getCurrentRound() == round) {
                    log.info("Timeout triggered for room [{}] at round [{}]", roomId, round);
                    
                    boolean hasNext = room.moveToNextRound();
                    redisLockRepository.unlockAnswer(roomId); // 선착순 정답 락 해제

                    if (hasNext) {
                        // 다음 문제 출제 브로드캐스팅
                        GameQuestionResDTO questionResDTO = GameQuizConverter.toQuestionResDTO(room);
                        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/question", questionResDTO);

                        // 시스템 메시지 발행
                        String timeoutMsg = "시간 초과! 아무도 정답을 맞추지 못했습니다. 다음 문제가 출제되었습니다.";
                        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
                            GameMessageConverter.toSystemResDTO(roomId, null, "SYSTEM", timeoutMsg, GameMessageType.TALK));

                        // 타임아웃 재예약 (프론트 3초 딜레이 감안해 13초 타임아웃)
                        scheduleTimeout(roomId, room.getCurrentRound(), 13L);
                    } else {
                        // 게임 최종 종료 처리
                        room.endQuizDirect();

                        String endMsg = "게임이 종료되었습니다! 최종 결과 스코어가 대기방에 반영되었습니다.";
                        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/start", 
                            GameStartConverter.toResDTO(room, endMsg));
                        
                        messagingTemplate.convertAndSend("/topic/room/" + roomId, 
                            GameMessageConverter.toSystemResDTO(roomId, null, "SYSTEM", endMsg, GameMessageType.END));

                        // 방 상태 강제 동기화
                        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/status", 
                            GameRoomConverter.toRoomStatusResDTO(room));
                    }
                }
            } finally {
                room.getLock().unlock();
            }
        });
    }
}
