package com.heesik.backend.domain.analysis.error;

import com.heesik.backend.global.error.code.BaseErrorCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

/**
 * 우리말샘 API 응답 시 발생할 수 있는 에러 코드 및 연동 과정에서의 에러를 나타내는 Enum
 */
@Getter
@RequiredArgsConstructor
public enum UrimalsaemErrorCode implements BaseErrorCode {
    // 우리말샘 API 정의 오류 코드
    SYSTEM_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "URIMAL_000", "우리말샘 API 시스템 오류입니다."),
    UNREGISTERED_KEY(HttpStatus.UNAUTHORIZED, "URIMAL_020", "등록되지 않은 우리말샘 인증키입니다."),
    KEY_TEMPORARY_UNAVAILABLE(HttpStatus.FORBIDDEN, "URIMAL_021", "일시적으로 사용 중지된 우리말샘 인증키입니다."),
    INCORRECT_QUERY(HttpStatus.BAD_REQUEST, "URIMAL_100", "부적절한 쿼리 요청입니다."),
    INVALID_TARGET(HttpStatus.BAD_REQUEST, "URIMAL_101", "부적절한 검색 필드입니다."),
    INVALID_METHOD(HttpStatus.BAD_REQUEST, "URIMAL_102", "부적절한 검색 방식입니다."),
    INVALID_NUM(HttpStatus.BAD_REQUEST, "URIMAL_103", "부적절한 검색 개수입니다."),
    INVALID_START(HttpStatus.BAD_REQUEST, "URIMAL_104", "부적절한 start 값입니다."),
    INVALID_SORT(HttpStatus.BAD_REQUEST, "URIMAL_105", "부적절한 정렬순입니다."),
    INVALID_ADVANCED(HttpStatus.BAD_REQUEST, "URIMAL_106", "부적절한 자세히 찾기 여부입니다."),
    INVALID_LANG(HttpStatus.BAD_REQUEST, "URIMAL_107", "부적절한 언어 값입니다."),
    INVALID_NORM(HttpStatus.BAD_REQUEST, "URIMAL_108", "부적절한 규범 유형 값입니다."),
    INVALID_PART(HttpStatus.BAD_REQUEST, "URIMAL_109", "부적절한 검색 대상 값입니다."),

    // 연동 및 클라이언트 에러
    API_CLIENT_ERROR(HttpStatus.BAD_REQUEST, "URIMAL_CLIENT_4XX", "우리말샘 API 요청 중 클라이언트 오류가 발생했습니다."),
    API_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "URIMAL_SERVER_5XX", "우리말샘 API 서버 오류가 발생했습니다."),
    JSON_PARSING_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "URIMAL_PARSING_900", "우리말샘 API 응답 데이터 파싱 중 오류가 발생했습니다."),
    UNKNOWN_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "URIMAL_UNKNOWN", "우리말샘 API 호출 중 알 수 없는 에러가 발생했습니다.");

    private final HttpStatus status;
    private final String code;
    private final String message;

    // 우리말샘 API에서 반환하는 에러 코드 문자열을 UrimalsaemErrorCode enum 객체로 매핑
    public static UrimalsaemErrorCode fromCode(String errorCodeStr) {
        if (errorCodeStr == null) {
            return UNKNOWN_ERROR;
        }
        return switch (errorCodeStr.trim()) {
            case "000" -> SYSTEM_ERROR;
            case "020" -> UNREGISTERED_KEY;
            case "021" -> KEY_TEMPORARY_UNAVAILABLE;
            case "100" -> INCORRECT_QUERY;
            case "101" -> INVALID_TARGET;
            case "102" -> INVALID_METHOD;
            case "103" -> INVALID_NUM;
            case "104" -> INVALID_START;
            case "105" -> INVALID_SORT;
            case "106" -> INVALID_ADVANCED;
            case "107" -> INVALID_LANG;
            case "108" -> INVALID_NORM;
            case "109" -> INVALID_PART;
            default -> UNKNOWN_ERROR;
        };
    }
}
