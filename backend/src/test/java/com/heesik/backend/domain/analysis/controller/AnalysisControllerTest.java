package com.heesik.backend.domain.analysis.controller;

import com.heesik.backend.domain.analysis.dto.request.UrimalsaemReqDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO.UrimalsaemItem;
import com.heesik.backend.domain.analysis.error.UrimalsaemErrorCode;
import com.heesik.backend.domain.analysis.error.UrimalsaemException;
import com.heesik.backend.domain.analysis.service.AnalysisService;
import com.heesik.backend.global.error.handler.CustomExceptionHandler;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AnalysisControllerTest {

    private MockMvc mockMvc;

    @Mock
    private AnalysisService analysisService;

    @InjectMocks
    private AnalysisController analysisController;

    @BeforeEach
    void setUp() {
        // standaloneSetup 시 CustomExceptionHandler를 advice로 등록하여 예외 핸들링을 온전히 테스트합니다.
        mockMvc = MockMvcBuilders.standaloneSetup(analysisController)
                .setControllerAdvice(new CustomExceptionHandler())
                .setValidator(new LocalValidatorFactoryBean())
                .build();
    }

    @Test
    @DisplayName("우리말샘 사전 검색 API 성공 테스트")
    void searchUrimalsaem_Success() throws Exception {
        // given
        UrimalsaemItem item = new UrimalsaemItem(
                "나무",
                368281L,
                1,
                "줄기나 가지가 목질로 된 여러해살이 식물.",
                "명사",
                "https://opendict.korean.go.kr/dictionary/view?sense_no=368281",
                "일반어"
        );
        UrimalsaemResDTO resDto = new UrimalsaemResDTO(1, 1, 10, List.of(item));

        given(analysisService.searchUrimalsaem(any(UrimalsaemReqDTO.class))).willReturn(resDto);

        // when & then
        mockMvc.perform(get("/api/analysis/search")
                        .param("q", "나무")
                        .param("start", "1")
                        .param("num", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.total").value(1))
                .andExpect(jsonPath("$.start").value(1))
                .andExpect(jsonPath("$.num").value(10))
                .andExpect(jsonPath("$.items[0].word").value("나무"))
                .andExpect(jsonPath("$.items[0].targetCode").value(368281))
                .andExpect(jsonPath("$.items[0].definition").value("줄기나 가지가 목질로 된 여러해살이 식물."));
    }

    @Test
    @DisplayName("우리말샘 사전 검색 API 실패 - 필수 파라미터(q) 누락 시 400 에러 발생")
    void searchUrimalsaem_MissingParameter() throws Exception {
        // q 파라미터가 누락된 경우
        mockMvc.perform(get("/api/analysis/search")
                        .param("start", "1")
                        .param("num", "10")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("COMMON400_1")) // ConstraintViolationException 또는 MethodArgumentNotValidException 시 정의된 에러 코드 검증
                .andExpect(jsonPath("$.message").exists());
    }

    @Test
    @DisplayName("우리말샘 사전 검색 API 실패 - 등록되지 않은 API 키(020 에러)")
    void searchUrimalsaem_UnregisteredKey() throws Exception {
        // given
        // 비즈니스 룰상 020 에러 발생 시 UrimalsaemException이 터지는 상황을 연출
        given(analysisService.searchUrimalsaem(any(UrimalsaemReqDTO.class)))
                .willThrow(new UrimalsaemException(UrimalsaemErrorCode.UNREGISTERED_KEY));

        // when & then
        mockMvc.perform(get("/api/analysis/search")
                        .param("q", "나무")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized()) // HttpStatus.UNAUTHORIZED (401)
                .andExpect(jsonPath("$.errorCode").value("URIMAL_020"))
                .andExpect(jsonPath("$.message").value("등록되지 않은 우리말샘 인증키입니다."));
    }

    @Test
    @DisplayName("우리말샘 사전 검색 API 실패 - 부적절한 쿼리 요청(100 에러)")
    void searchUrimalsaem_IncorrectQuery() throws Exception {
        // given
        given(analysisService.searchUrimalsaem(any(UrimalsaemReqDTO.class)))
                .willThrow(new UrimalsaemException(UrimalsaemErrorCode.INCORRECT_QUERY));

        // when & then
        mockMvc.perform(get("/api/analysis/search")
                        .param("q", "나무")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest()) // HttpStatus.BAD_REQUEST (400)
                .andExpect(jsonPath("$.errorCode").value("URIMAL_100"))
                .andExpect(jsonPath("$.message").value("부적절한 쿼리 요청입니다."));
    }
}
