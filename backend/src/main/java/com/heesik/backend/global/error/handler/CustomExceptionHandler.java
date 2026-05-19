package com.heesik.backend.global.error.handler;

import com.heesik.backend.global.error.ErrorResDTO;
import com.heesik.backend.global.error.code.BaseErrorCode;
import com.heesik.backend.global.error.code.GeneralErrorCode;
import com.heesik.backend.global.error.exception.BaseException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.Optional;

@Slf4j
@RestControllerAdvice
public class CustomExceptionHandler {

    //  모든 예외 기본 처리
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResDTO> handle(Exception error) {
        log.error("Internal Server Error: {}", error.getMessage(), error);
        return buildErrorResponse(GeneralErrorCode.INTERNAL_SERVER_ERROR, error.getMessage());
    }


    // Custom Exception 처리
    @ExceptionHandler(BaseException.class)
    public ResponseEntity<ErrorResDTO> handleCustomException(BaseException error) {
        BaseErrorCode errorCode = error.getErrorCode();
        String errorMessage = error.getMessage();

        log.error("Custom Exception Code : {} Error: {}", errorCode, errorMessage, error);
        return buildErrorResponse(errorCode, error.getMessage());
    }


    // @Valid 범위값 오류
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResDTO> handleValidationExceptions(MethodArgumentNotValidException error) {
        String errorMessage = Optional.ofNullable(error.getBindingResult().getFieldError())
                .map(FieldError::getDefaultMessage)
                .orElse("유효하지 않은 입력값입니다.");

        return buildErrorResponse(GeneralErrorCode.INVALID_REQUEST_BODY, errorMessage);
    }


    // @RequestParam, @PathVariable 검증 실패
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResDTO> handleConstraintViolationException(ConstraintViolationException error) {
        String errorMessage = error.getConstraintViolations()
                .stream()
                .findFirst()
                .map(ConstraintViolation::getMessage)
                .orElse("유효하지 않은 입력값입니다.");

        return buildErrorResponse(GeneralErrorCode.INVALID_REQUEST_PARAMETER, errorMessage);
    }


    // 예외 dto 전달 공통 메서드
    private ResponseEntity<ErrorResDTO> buildErrorResponse(BaseErrorCode errorCode, String message) {
        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResDTO.builder()
                        .errorCode(errorCode.getCode())
                        .message(message)
                        .build());
    }

}