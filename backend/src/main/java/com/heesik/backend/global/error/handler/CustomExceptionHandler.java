package com.heesik.backend.global.error.handler;

import com.heesik.backend.global.error.ErrorResDTO;
import com.heesik.backend.global.error.code.BaseErrorCode;
import com.heesik.backend.global.error.exception.BaseException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;

@Slf4j
@RestControllerAdvice
public class CustomExceptionHandler {

    // 모든 예외 기본 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResDTO> handle(Exception error) {
        log.error("Internal Server Error: {}", error.getMessage(), error);
        return ResponseEntity
                .status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ErrorResDTO.builder()
                        .errorCode("500")
                        .message("서버 오류입니다. 잠시 후 다시 접속해주세요.")
                        .build());
    }

    // Custom Exception 처리
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResDTO> handleCustomException(BaseException e) {
        BaseErrorCode errorCode = e.getErrorCode();

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResDTO.builder()
                        .errorCode(errorCode.getCode())
                        .message(e.getMessage())
                        .build());
    }

    // @Valid 범위값 오류
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResDTO> handleValidationExceptions(MethodArgumentNotValidException ex) {

        // 첫 번째 에러 메시지를 추출
        String errorMessage = Optional.ofNullable(ex.getBindingResult().getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElse("유효하지 않은 입력값입니다.");

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(ErrorResDTO.builder()
                        .errorCode("400")
                        .message(errorMessage)
                        .build());
    }

}