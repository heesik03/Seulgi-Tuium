package com.heesik.backend.domain.game.repository;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ValueOperations;
import org.springframework.data.redis.core.script.RedisScript;

import java.time.Duration;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RedisLockRepositoryTest {

    @Mock
    private RedisTemplate<String, String> redisTemplate;

    @Mock
    private ValueOperations<String, String> valueOperations;

    private RedisLockRepository redisLockRepository;

    @BeforeEach
    void setUp() {
        redisLockRepository = new RedisLockRepository(redisTemplate);
    }

    @Test
    @DisplayName("락 획득 시 setIfAbsent 결과가 true면 락 획득에 성공한다")
    void lock_success() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:10"), eq("myLock"), any(Duration.class)))
                .thenReturn(true);

        // when
        Boolean result = redisLockRepository.lock(10L, "myLock");

        // then
        assertTrue(result);
        verify(valueOperations, times(1)).setIfAbsent(eq("lock:room:10"), eq("myLock"), any(Duration.class));
    }

    @Test
    @DisplayName("락 획득 시 setIfAbsent 결과가 false면 락 획득에 실패한다")
    void lock_fail() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:10"), eq("myLock"), any(Duration.class)))
                .thenReturn(false);

        // when
        Boolean result = redisLockRepository.lock(10L, "myLock");

        // then
        assertFalse(result);
    }

    @Test
    @DisplayName("선착순 정답 락 획득 성공 검증")
    void lockAnswer_success() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:answer:10"), eq("solved"), any(Duration.class)))
                .thenReturn(true);

        // when
        Boolean result = redisLockRepository.lockAnswer(10L);

        // then
        assertTrue(result);
    }

    @Test
    @DisplayName("선착순 정답 락 획득 실패 검증")
    void lockAnswer_fail() {
        // given
        when(redisTemplate.opsForValue()).thenReturn(valueOperations);
        when(valueOperations.setIfAbsent(eq("lock:room:answer:10"), eq("solved"), any(Duration.class)))
                .thenReturn(false);

        // when
        Boolean result = redisLockRepository.lockAnswer(10L);

        // then
        assertFalse(result);
    }

    @Test
    @DisplayName("락 해제 시 Lua 스크립트가 실행되고 1을 반환하면 성공한다")
    void unlock_success() {
        // given
        when(redisTemplate.execute(any(RedisScript.class), eq(Collections.singletonList("lock:room:10")), eq("myLock")))
                .thenReturn(1L);

        // when
        Boolean result = redisLockRepository.unlock(10L, "myLock");

        // then
        assertTrue(result);
        verify(redisTemplate, times(1)).execute(any(RedisScript.class), eq(Collections.singletonList("lock:room:10")), eq("myLock"));
    }
}
