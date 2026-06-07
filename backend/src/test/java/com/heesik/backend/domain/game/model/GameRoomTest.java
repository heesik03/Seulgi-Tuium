package com.heesik.backend.domain.game.model;

import com.heesik.backend.global.error.code.GameErrorCode;
import com.heesik.backend.global.error.exception.GameException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.*;

class GameRoomTest {

    @Test
    @DisplayName("최초 입장 유저는 방장으로 임명된다")
    void join_firstUser_becomesHost() {
        // given
        GameRoom room = new GameRoom(10L);

        // when
        room.join(1L, "Alice");

        // then
        GameParticipant host = room.getParticipants().getFirst();
        assertEquals(1L, host.getUserId());
        assertTrue(host.getIsHost());
    }

    @Test
    @DisplayName("방 정원은 최대 4명이며 초과 시 예외가 발생한다")
    void join_maxFourParticipants() {
        // given
        GameRoom room = new GameRoom(10L);
        room.join(1L, "Alice");
        room.join(2L, "Bob");
        room.join(3L, "Charlie");
        room.join(4L, "David");

        // when & then
        GameException exception = assertThrows(GameException.class, () -> room.join(5L, "Eve"));
        assertEquals(GameErrorCode.GAME_ROOM_FULL, exception.getErrorCode());
    }

    @Test
    @DisplayName("동시에 100명이 가입을 시도해도 정원은 정확히 4명만 가입된다")
    void join_concurrency_limitFour() throws InterruptedException {
        // given
        GameRoom room = new GameRoom(10L);
        int threadCount = 100;
        ExecutorService executorService = Executors.newFixedThreadPool(16);
        CountDownLatch latch = new CountDownLatch(threadCount);
        AtomicInteger successCount = new AtomicInteger();
        AtomicInteger failCount = new AtomicInteger();

        // when
        for (int i = 1; i <= threadCount; i++) {
            final long userId = i;
            executorService.submit(() -> {
                try {
                    room.join(userId, "User" + userId);
                    successCount.incrementAndGet();
                } catch (GameException e) {
                    failCount.incrementAndGet();
                } finally {
                    latch.countDown();
                }
            });
        }
        latch.await();
        executorService.shutdown();

        // then
        assertEquals(4, room.getParticipants().size());
        assertEquals(4, successCount.get());
        assertEquals(96, failCount.get());
    }

    @Test
    @DisplayName("방장이 퇴장하면 남은 첫 번째 유저에게 방장이 자동 위임된다")
    void leave_hostLeaves_delegatesToNext() {
        // given
        GameRoom room = new GameRoom(10L);
        room.join(1L, "Alice"); // 방장
        room.join(2L, "Bob");

        // when
        room.leave(1L);

        // then
        assertEquals(1, room.getParticipants().size());
        GameParticipant newHost = room.getParticipants().getFirst();
        assertEquals(2L, newHost.getUserId());
        assertTrue(newHost.getIsHost());
    }

    @Test
    @DisplayName("방장 수동 위임 시 이전 방장의 권한이 박탈되고 대상자가 방장이 된다")
    void delegateHost_success() {
        // given
        GameRoom room = new GameRoom(10L);
        room.join(1L, "Alice"); // 방장
        room.join(2L, "Bob");
        room.join(3L, "Charlie");
        room.getParticipants().get(1).setIsReady(true); // Bob 레디 설정

        // when
        room.delegateHost(1L, 2L);

        // then
        GameParticipant alice =
                room.getParticipants().stream().filter(p -> p.getUserId().equals(1L)).findFirst().get();
        GameParticipant bob =
                room.getParticipants().stream().filter(p -> p.getUserId().equals(2L)).findFirst().get();

        assertFalse(alice.getIsHost());
        assertTrue(bob.getIsHost());
        assertFalse(bob.getIsReady()); // 새 방장은 레디 자동 해제
    }

    @Test
    @DisplayName("10초 제한 시간이 만료되면 정답을 입력해도 채점 시 오답 처리된다")
    void submitAnswer_timeout_returnsFalse() {
        // given
        GameRoom room = new GameRoom(10L);
        room.join(1L, "Alice");
        
        java.util.List<com.heesik.backend.domain.word.entity.Word> mockWords = java.util.List.of(
                com.heesik.backend.domain.word.entity.Word.builder().expression("사과").meaning("붉고 아삭한 과일").build()
        );
        room.startQuiz(1L, mockWords);

        // 수동으로 10초 만료 시각을 과거로 조작 (Lazy Evaluation 10초 타임아웃 강제 발생)
        try {
            java.lang.reflect.Field expiredField = GameRoom.class.getDeclaredField("questionExpiredAt");
            expiredField.setAccessible(true);
            expiredField.set(room, LocalDateTime.now().minusSeconds(1));
        } catch (Exception e) {
            fail("Reflection failed: " + e.getMessage());
        }

        // when
        Boolean result = room.submitAnswer(1L, "사과");

        // then
        assertFalse(result); // 시간 만료로 인해 오답 처리
        assertEquals(0, room.getScore(1L)); // 점수 0점 유지
    }
}
