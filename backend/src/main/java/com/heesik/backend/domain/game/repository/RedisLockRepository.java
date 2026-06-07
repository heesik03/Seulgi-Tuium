package com.heesik.backend.domain.game.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.script.DefaultRedisScript;
import org.springframework.stereotype.Repository;

import java.time.Duration;
import java.util.Collections;

@Repository
@RequiredArgsConstructor
public class RedisLockRepository {

    private final RedisTemplate<String, String> redisTemplate;

    // 비즈니스 트랜잭션 락 (SETNX 3초 타임아웃)
    public Boolean lock(Long roomId, String lockValue) {
        String key = generateKey(roomId);
        return redisTemplate.opsForValue()
                .setIfAbsent(key, lockValue, Duration.ofMillis(3000));
    }

    // 비즈니스 트랜잭션 락 해제 (Lua Script로 원자성 보장)
    public Boolean unlock(Long roomId, String lockValue) {
        String key = generateKey(roomId);
        String script =
                "if redis.call('get', KEYS[1]) == ARGV[1] then " +
                "    return redis.call('del', KEYS[1]) " +
                "else " +
                "    return 0 " +
                "end";

        DefaultRedisScript<Long> redisScript = new DefaultRedisScript<>(script, Long.class);
        Long result = redisTemplate.execute(redisScript, Collections.singletonList(key), lockValue);
        return result != null && result > 0;
    }

    // 선착순 1인 정답자 선점용 락 획득 (10초 유효)
    public Boolean lockAnswer(Long roomId) {
        String key = generateAnswerKey(roomId);
        return redisTemplate.opsForValue()
                .setIfAbsent(key, "solved", Duration.ofSeconds(10));
    }

    // 선착순 락 강제 초기화 (다음 문제 출제 시 리셋)
    public Boolean unlockAnswer(Long roomId) {
        String key = generateAnswerKey(roomId);
        return redisTemplate.delete(key);
    }

    // 트랜잭션 락 키 정의
    private String generateKey(Long roomId) {
        return "lock:room:" + roomId;
    }

    // 정답 선착순 락 키 정의
    private String generateAnswerKey(Long roomId) {
        return "lock:room:answer:" + roomId;
    }
}
