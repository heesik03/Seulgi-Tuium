package com.heesik.backend.global.error.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum QuizErrorCode implements BaseErrorCode {
    QUIZ_NOT_FOUND(HttpStatus.NOT_FOUND, "QUIZ_001", "퀴즈를 찾을 수 없습니다."),
    QUIZ_ACCESS_DENIED(HttpStatus.FORBIDDEN, "QUIZ_002", "퀴즈 삭제 권한이 없습니다."),
    QUIZ_QUESTION_NOT_FOUND(HttpStatus.NOT_FOUND, "QUIZ_003", "해당 퀴즈에 포함되지 않은 문제입니다."),
    QUIZ_HISTORY_NOT_FOUND(HttpStatus.NOT_FOUND, "QUIZ_004", "퀴즈 이력을 찾을 수 없습니다."),
    QUIZ_HISTORY_ACCESS_DENIED(HttpStatus.FORBIDDEN, "QUIZ_005", "퀴즈 이력 삭제 권한이 없습니다."),
    QUIZ_GENERATION_FAILED(HttpStatus.INTERNAL_SERVER_ERROR, "QUIZ_006", "Gemini API로부터 퀴즈 문제를 생성하지 못했습니다."),
    QUIZ_EMPTY_QUESTIONS(HttpStatus.BAD_REQUEST, "QUIZ_007", "퀴즈에 등록된 문제가 없습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;
}



