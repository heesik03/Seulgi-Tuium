package com.heesik.backend.domain.analysis.error;

import com.heesik.backend.global.error.exception.BaseException;

/**
 * 우리말샘 API 호출 또는 연동 오류 시 던질 커스텀 예외 클래스
 */
public class UrimalsaemException extends BaseException {
    public UrimalsaemException(UrimalsaemErrorCode errorCode) {
        super(errorCode);
    }
}
