package com.heesik.backend.domain.game.service;

import com.heesik.backend.domain.game.dto.request.GameMessageReqDTO;
import com.heesik.backend.domain.game.dto.response.GameMessageResDTO;
import com.heesik.backend.domain.game.enums.GameMessageType;
import com.heesik.backend.domain.game.model.GameRoom;
import com.heesik.backend.domain.game.repository.GameRoomRepository;
import com.heesik.backend.domain.game.repository.RedisLockRepository;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.GameErrorCode;
import com.heesik.backend.global.error.exception.GameException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.List;
import java.util.Optional;
import java.lang.reflect.Field;
import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameMessageServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private GameRoomRepository gameRoomRepository;

    @Mock
    private RedisLockRepository redisLockRepository;

    @Mock
    private WordRepository wordRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private GameMessageService gameMessageService;

    private User alice;
    private User bob;
    private GameRoom room;

    @BeforeEach
    void setUp() {
        // 테스트 공통 유저 구성
        alice = User.builder().email("alice@test.com").name("Alice").build();
        bob = User.builder().email("bob@test.com").name("Bob").build();
        
        try {
            Field idField = User.class.getDeclaredField("id");
            idField.setAccessible(true);
            idField.set(alice, 1L);
            idField.set(bob, 2L);
        } catch (Exception e) {
            fail(e.getMessage());
        }

        // 실제 GameRoom 인스턴스 사용
        room = new GameRoom(10L, "테스트 방");
    }

    @Test
    @DisplayName("유저가 입장(ENTER)하면 방에 참가자로 등록되고 환영 메시지가 반환된다")
    void process_enter_success() {
        // given
        GameMessageReqDTO req = new GameMessageReqDTO(10L, GameMessageType.ENTER, "", null);
        when(gameRoomRepository.findOrCreateRoom(10L)).thenReturn(room);

        // when
        GameMessageResDTO res = gameMessageService.processGameMessage(req, 1L, "Alice");

        // then
        assertEquals("Alice님이 퀴즈방에 입장하셨습니다.", res.message());
        assertEquals(1, room.getParticipants().size());
        assertEquals(1L, room.getParticipants().getFirst().getUserId());
    }

    @Test
    @DisplayName("퀴즈 시작(START) 시 락 획득에 실패하면 예외를 던진다")
    void process_start_lockFail_throwsException() {
        // given
        GameMessageReqDTO req = new GameMessageReqDTO(10L, GameMessageType.START, "", null);
        room.join(1L, "Alice");
        when(gameRoomRepository.findOrCreateRoom(10L)).thenReturn(room);
        
        // 락 획득 실패 모킹
        when(redisLockRepository.lock(10L, "1")).thenReturn(false);

        // when & then
        GameException exception = assertThrows(GameException.class, 
                () -> gameMessageService.processGameMessage(req, 1L, "Alice"));
        assertEquals(GameErrorCode.GAME_ALREADY_STARTED, exception.getErrorCode());
    }

    @Test
    @DisplayName("1등 정답 선착순 락 획득 시나리오 검증 (100개 스레드 동시 제출 시 단 1명만 정답 인정)")
    void submitAnswerFirstComeFirstServed() throws InterruptedException {
        // given
        Long roomId = 10L;
        room.join(1L, "Alice");
        
        List<Word> mockWords = List.of(
                Word.builder().expression("사과").meaning("가을 대표 과일").build()
        );
        room.startQuiz(1L, mockWords);

        when(gameRoomRepository.findOrCreateRoom(roomId)).thenReturn(room);

        // Redis Lock 모킹: 첫 번째 호출만 true, 나머지는 false 반환
        AtomicBoolean firstLock = new AtomicBoolean(true);
        when(redisLockRepository.lockAnswer(roomId)).thenAnswer(invocation -> firstLock.getAndSet(false));

        int threadCount = 100;
        ExecutorService executorService = Executors.newFixedThreadPool(32);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // when
        AtomicInteger successCount = new AtomicInteger(0);
        for (int i = 0; i < threadCount; i++) {
            long userId = i + 2L; // 2부터 101까지
            executorService.submit(() -> {
                try {
                    GameMessageReqDTO reqDTO = new GameMessageReqDTO(roomId, GameMessageType.SUBMIT, "사과", null);
                    var resDTO = gameMessageService.processGameMessage(reqDTO, userId, "User" + userId);
                    if (resDTO.isCorrect() != null && resDTO.isCorrect()) {
                        successCount.incrementAndGet();
                    }
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();

        // then
        assertThat(successCount.get()).isEqualTo(1); // 오직 1명만 정답 판정을 받아야 함
    }

    @Test
    @DisplayName("synchronized/ReentrantLock 임계 영역 동시 입장 제한 검증 (10개 스레드 동시 진입 모사)")
    void concurrentJoinRoom() throws InterruptedException {
        // given
        Long roomId = 10L;
        // GameRoom 내부의 participants는 ReentrantLock으로 보호됨
        
        int threadCount = 10;
        ExecutorService executorService = Executors.newFixedThreadPool(threadCount);
        CountDownLatch latch = new CountDownLatch(threadCount);

        // when
        for (int i = 0; i < threadCount; i++) {
            long userId = i + 1L;
            executorService.submit(() -> {
                try {
                    // 예외 발생 시 무시하고 카운트다운 (최대 4명 초과 시 예외 발생)
                    room.join(userId, "User" + userId);
                } catch (Exception e) {
                    // Expected exception (GameException GAME_ROOM_FULL)
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();

        // then
        assertThat(room.getParticipants().size()).isEqualTo(4); // 인원 제한인 최대 4명까지만 입장에 성공해야 함
    }

    @Test
    @DisplayName("선착순 락을 획득했으나, 이미 문제 유효 시간이 만료되어 정답 제출이 실패하고 오답/만료 피드백을 반환한다")
    void submitAnswer_lockAcquiredButExpired_returnsFalse() {
        // given
        Long roomId = 10L;
        room.join(1L, "Alice");
        
        List<Word> mockWords = List.of(
                Word.builder().expression("사과").meaning("가을 대표 과일").build()
        );
        room.startQuiz(1L, mockWords);
        
        // 문제 만료 시간 강제 조작 (30초 전으로 만료시킴)
        try {
            Field expiredField = GameRoom.class.getDeclaredField("questionExpiredAt");
            expiredField.setAccessible(true);
            expiredField.set(room, LocalDateTime.now().minusSeconds(30));
        } catch (Exception e) {
            fail(e.getMessage());
        }

        when(gameRoomRepository.findOrCreateRoom(roomId)).thenReturn(room);
        
        // 1등 락 획득 성공 모킹
        when(redisLockRepository.lockAnswer(roomId)).thenReturn(true);

        GameMessageReqDTO reqDTO = new GameMessageReqDTO(roomId, GameMessageType.SUBMIT, "사과", null);

        // when
        GameMessageResDTO resDTO = gameMessageService.processGameMessage(reqDTO, 2L, "Bob");

        // then
        assertFalse(resDTO.isCorrect());
        assertTrue(resDTO.message().contains("이미 만료되었습니다."));
        // 락이 반납되었는지 검증
        verify(redisLockRepository, times(1)).unlockAnswer(roomId);
    }
}
