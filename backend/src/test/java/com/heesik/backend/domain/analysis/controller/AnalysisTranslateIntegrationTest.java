package com.heesik.backend.domain.analysis.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.dto.request.AnalysisTranslateReqDTO;
import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO.UrimalsaemItem;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AnalysisTranslateIntegrationTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AnalysisService analysisService;

    @InjectMocks
    private AnalysisController analysisController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(analysisController)
                .setControllerAdvice(new CustomExceptionHandler())
                .setValidator(new LocalValidatorFactoryBean())
                .build();
    }

    @Test
    @DisplayName("어려운 말 번역 및 단어 뜻 검색 API 성공 테스트")
    void translateAndSearch_Success() throws Exception {
        // given
        AnalysisTranslateReqDTO reqDto = new AnalysisTranslateReqDTO("금일 피고인은 법정에 출석하지 아니하였다.");
        
        UrimalsaemItem item1 = new UrimalsaemItem(
                "금일",
                10001L,
                1,
                "이제까지 지나간 오늘 하루.",
                "명사",
                "https://link1.com",
                "일반어"
        );
        UrimalsaemItem item2 = new UrimalsaemItem(
                "피고인",
                10002L,
                1,
                "형사 소송에서 형사 책임을 져야 할 자로 공소 제기를 받은 사람.",
                "명사",
                "https://link2.com",
                "일반어"
        );
        
        AnalysisTranslateResDTO resDto = new AnalysisTranslateResDTO(
                "오늘 피고인은 법정에 나오지 않았다.",
                List.of(item1, item2)
        );

        given(analysisService.translateAndSearch(any(AnalysisTranslateReqDTO.class))).willReturn(resDto);

        // when & then
        mockMvc.perform(post("/api/analysis/translate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.convertedText").value("오늘 피고인은 법정에 나오지 않았다."))
                .andExpect(jsonPath("$.words[0].word").value("금일"))
                .andExpect(jsonPath("$.words[0].definition").value("이제까지 지나간 오늘 하루."))
                .andExpect(jsonPath("$.words[1].word").value("피고인"))
                .andExpect(jsonPath("$.words[1].definition").value("형사 소송에서 형사 책임을 져야 할 자로 공소 제기를 받은 사람."));
    }

    @Test
    @DisplayName("어려운 말 번역 및 단어 뜻 검색 API 실패 - 1000자 초과 텍스트 전달 시 400 에러 발생")
    void translateAndSearch_TextTooLong() throws Exception {
        // given
        String tooLongText = "A".repeat(1001); // 1001자
        AnalysisTranslateReqDTO reqDto = new AnalysisTranslateReqDTO(tooLongText);

        // when & then
        mockMvc.perform(post("/api/analysis/translate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("COMMON400_1"));
    }

    @Test
    @DisplayName("어려운 말 번역 및 단어 뜻 검색 API 실패 - 빈 텍스트 전달 시 400 에러 발생")
    void translateAndSearch_TextBlank() throws Exception {
        // given
        AnalysisTranslateReqDTO reqDto = new AnalysisTranslateReqDTO("");

        // when & then
        mockMvc.perform(post("/api/analysis/translate")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(reqDto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.errorCode").value("COMMON400_1"));
    }
}
