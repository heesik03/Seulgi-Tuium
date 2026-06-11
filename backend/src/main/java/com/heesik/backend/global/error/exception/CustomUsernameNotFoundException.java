package com.heesik.backend.global.error.exception;

import com.heesik.backend.global.error.code.UserErrorCode;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

/**
 * Spring Security의 UserDetailsService 규격을 충족하면서도
 * 커스텀 에러 코드를 내부적으로 관리하기 위해 구현된 UsernameNotFoundException의 커스텀 확장 클래스입니다.
 */
public class CustomUsernameNotFoundException extends UsernameNotFoundException {
    
    private final UserErrorCode errorCode;

    public CustomUsernameNotFoundException(UserErrorCode errorCode) {
        super(errorCode.getMessage());
        this.errorCode = errorCode;
    }

    public UserErrorCode getErrorCode() {
        return errorCode;
    }
}
