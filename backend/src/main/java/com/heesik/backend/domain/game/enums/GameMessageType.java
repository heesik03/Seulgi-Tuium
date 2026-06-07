package com.heesik.backend.domain.game.enums;

public enum GameMessageType {
    ENTER,    // 방 입장
    LEAVE,    // 방 퇴장
    TALK,     // 일반 채팅
    READY,    // 준비 상태 토글
    START,    // 퀴즈 시작
    DELEGATE, // 방장 위임
    END,      // 퀴즈 종료
    SUBMIT    // 정답 제출
}
