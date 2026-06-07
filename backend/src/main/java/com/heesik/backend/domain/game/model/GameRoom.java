package com.heesik.backend.domain.game.model;

import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.global.error.code.GameErrorCode;
import com.heesik.backend.global.error.exception.GameException;
import lombok.Getter;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.concurrent.locks.ReentrantLock;

@Getter
public class GameRoom {

    private final Long roomId;
    private final List<GameParticipant> participants = new CopyOnWriteArrayList<>();
    private final ReentrantLock lock = new ReentrantLock();
    private final Map<Long, Integer> scores = new ConcurrentHashMap<>(); // 유저별 누적 스코어

    private final List<Word> quizWords = new CopyOnWriteArrayList<>();
    private Integer currentRound = 0;

    private Boolean isStarted = false; // 퀴즈 시작 여부
    private String currentWord; // 현재 문제 정답 단어
    private String currentDefinition; // 현재 문제 정의
    private LocalDateTime questionExpiredAt; // 문제 만료 시각

    public GameRoom(Long roomId) {
        this.roomId = roomId;
    }

    // 신규 참가자 추가 및 최대 4명 제한 검증
    public void join(Long userId, String name) {
        lock.lock();
        try {
            boolean exists = participants.stream()
                    .anyMatch(p -> p.getUserId().equals(userId));
            if (exists) {
                return;
            }

            // 인원 제한 4명 체크
            if (participants.size() >= 4) {
                throw new GameException(GameErrorCode.GAME_ROOM_FULL);
            }

            // 방이 비어있으면 첫 입장 유저를 방장으로 지정
            boolean isHost = participants.isEmpty();
            participants.add(new GameParticipant(userId, name, isHost, false));
            scores.put(userId, 0);
        } finally {
            lock.unlock();
        }
    }

    // 참가자 퇴장 처리 및 스코어 해제
    public void leave(Long userId) {
        lock.lock();
        try {
            participants.removeIf(p -> p.getUserId().equals(userId));
            scores.remove(userId);

            // 방장이 나갔는데 남은 사람이 있다면 첫 번째 사람에게 방장 위임
            boolean hasHost = participants.stream().anyMatch(GameParticipant::getIsHost);
            if (!hasHost && !participants.isEmpty()) {
                participants.getFirst().setIsHost(true);
            }
        } finally {
            lock.unlock();
        }
    }

    // 준비 상태 토글
    public void toggleReady(Long userId) {
        lock.lock();
        try {
            participants.stream()
                    .filter(p -> p.getUserId().equals(userId))
                    .filter(p -> !p.getIsHost()) // 방장은 제외
                    .findFirst()
                    .ifPresent(p -> p.setIsReady(!p.getIsReady()));
        } finally {
            lock.unlock();
        }
    }

    // 퀴즈 시작 상태 변경 및 스코어 보드 전체 0점 리셋
    public void startQuiz(Long userId, List<Word> words) {
        lock.lock();
        try {
            GameParticipant requester = findParticipant(userId);

            // 방장 권한 확인
            if (!requester.getIsHost()) {
                throw new GameException(GameErrorCode.GAME_NOT_HOST);
            }

            // 이미 시작했는지 확인
            if (this.isStarted) {
                throw new GameException(GameErrorCode.GAME_ALREADY_STARTED);
            }

            this.isStarted = true;
            this.quizWords.clear();
            this.quizWords.addAll(words);
            this.currentRound = 0;
            
            scores.keySet().forEach(key -> scores.put(key, 0));
            setupNextQuestion();
        } finally {
            lock.unlock();
        }
    }

    // 다음 라운드 문제 설정 내부 헬퍼 (락은 호출자에서 제어됨)
    private boolean setupNextQuestion() {
        if (this.currentRound < this.quizWords.size()) {
            Word word = this.quizWords.get(this.currentRound);
            this.currentWord = word.getExpression();
            this.currentDefinition = word.getMeaning();
            this.questionExpiredAt = LocalDateTime.now().plusSeconds(10);
            return true;
        }
        return false;
    }

    // 다음 라운드 진행 처리
    public boolean moveToNextRound() {
        lock.lock();
        try {
            if (!this.isStarted) {
                return false;
            }
            this.currentRound++;
            return setupNextQuestion();
        } finally {
            lock.unlock();
        }
    }

    // 퀴즈 강제 종료 처리 및 대기 롤백 (방장 수동 요청용)
    public void endQuiz(Long userId) {
        lock.lock();
        try {
            GameParticipant requester = findParticipant(userId);

            // 방장 권한 확인
            if (!requester.getIsHost()) {
                throw new GameException(GameErrorCode.GAME_NOT_HOST);
            }

            // 게임이 시작되지 않은 상태면 에러
            if (!this.isStarted) {
                throw new GameException(GameErrorCode.GAME_NOT_STARTED);
            }

            endQuizDirect();
        } finally {
            lock.unlock();
        }
    }

    // 시스템 및 스케줄러에 의한 자동/비강제 게임 종료 처리
    public void endQuizDirect() {
        lock.lock();
        try {
            this.isStarted = false;
            this.currentWord = null;
            this.currentDefinition = null;
            this.questionExpiredAt = null;
            this.currentRound = 0;
            this.quizWords.clear();

            // 대기 상태 복귀를 위해 전원 레디 상태 리셋 (방장 제외)
            participants.forEach(p -> {
                if (!p.getIsHost()) {
                    p.setIsReady(false);
                }
            });
        } finally {
            lock.unlock();
        }
    }

    // 문제 등록 및 10초 만료 설정 (디버그/테스트용 유지)
    public void setQuestion(String word, String definition) {
        lock.lock();
        try {
            if (!this.isStarted) {
                throw new GameException(GameErrorCode.GAME_NOT_STARTED);
            }
            this.currentWord = word;
            this.currentDefinition = definition;
            this.questionExpiredAt = LocalDateTime.now().plusSeconds(10);
        } finally {
            lock.unlock();
        }
    }

    // 답변 제출 및 정답 채점 (정답 시 10점 누적, 10초 초과 시 자동 오답 처리)
    public Boolean submitAnswer(Long userId, String answer) {
        lock.lock();
        try {
            if (!this.isStarted || this.currentWord == null) {
                return false;
            }

            // 10초 제한 시간 만료 체크 (Lazy Evaluation 기법)
            if (LocalDateTime.now().isAfter(this.questionExpiredAt)) {
                return false;
            }

            // 대소문자 및 공백 제거 비교로 1차 정오 판별성 강화
            String targetAnswer = answer.trim();
            if (this.currentWord.equalsIgnoreCase(targetAnswer)) {
                scores.merge(userId, 10, Integer::sum);
                return true;
            }

            return false;
        } finally {
            lock.unlock();
        }
    }

    // 점수 획득 조회 헬퍼
    public Integer getScore(Long userId) {
        lock.lock();
        try {
            return scores.getOrDefault(userId, 0);
        } finally {
            lock.unlock();
        }
    }

    // 방장 수동 위임 처리
    public void delegateHost(Long userId, Long targetUserId) {
        lock.lock();
        try {
            GameParticipant requester = findParticipant(userId);

            // 방장 권한 확인
            if (!requester.getIsHost()) {
                throw new GameException(GameErrorCode.GAME_NOT_HOST);
            }

            // 위임 대상자 조회
            GameParticipant target = findParticipant(targetUserId);

            // 방장 권한 이전 및 대상자 레디 해제
            requester.setIsHost(false);
            target.setIsHost(true);
            target.setIsReady(false);
        } finally {
            lock.unlock();
        }
    }

    // 방 내부 참가자 탐색 헬퍼
    private GameParticipant findParticipant(Long userId) {
        return participants.stream()
                .filter(p -> p.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new GameException(GameErrorCode.GAME_ROOM_NOT_FOUND));
    }
}
