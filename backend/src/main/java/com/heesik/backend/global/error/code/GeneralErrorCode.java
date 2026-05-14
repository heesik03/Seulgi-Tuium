package com.heesik.backend.global.error.code;

import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum GeneralErrorCode implements BaseErrorCode {
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR,
            "COMMON500_1",
            "서버에서 에러가 발생했습니다."),
    UTILITY_CLASS_INSTANTIATION(HttpStatus.INTERNAL_SERVER_ERROR,
            "COMMON500_2",
            "유틸리티 클래스는 인스턴스화 하면 안됩니다."),
    INVALID_REQUEST_BODY(
            HttpStatus.BAD_REQUEST,
            "COMMON400_1",
            "요청 본문 값이 올바르지 않습니다."
    ),
    INVALID_REQUEST_PARAMETER(
            HttpStatus.BAD_REQUEST,
            "COMMON400_2",
            "요청 파라미터 값이 올바르지 않습니다."
    )
    ;


    private final HttpStatus status;
    private final String code;
    private final String message;
}
