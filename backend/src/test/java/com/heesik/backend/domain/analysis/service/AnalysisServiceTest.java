package com.heesik.backend.domain.analysis.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.analysis.dto.request.AnalysisTranslateReqDTO;
import com.heesik.backend.domain.analysis.dto.response.AnalysisTranslateResDTO;
import com.heesik.backend.domain.analysis.enums.TranslationTone;
import com.heesik.backend.global.client.GeminiClient;
import com.heesik.backend.global.error.code.GeminiErrorCode;
import com.heesik.backend.global.error.exception.GeminiException;
import com.heesik.backend.global.util.PromptProvider;
import kr.co.shineware.nlp.komoran.core.Komoran;
import kr.co.shineware.nlp.komoran.model.KomoranResult;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.anyMap;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.mock;

@ExtendWith(MockitoExtension.class)
class AnalysisServiceTest {

    @Mock
    private GeminiClient geminiClient;

    @Mock
    private PromptProvider promptProvider;

    @Mock
    private Komoran komoran;

    @Spy
    private ObjectMapper objectMapper = new ObjectMapper();

    @InjectMocks
    private AnalysisService analysisService;

    @BeforeEach
    void setUp() {
        // Reflection을 통해 private 필드인 userPromptTemplate 주입
        ReflectionTestUtils.setField(analysisService, "userPromptTemplate", "mockPromptTemplate");
    }

    @Test
    @DisplayName("translateAndSearch - Gemini가 올바른 JSON 스키마 응답을 반환할 때, 쉬운 말 번역 및 단어 리스트 추출 검증")
    void translateAndSearch_Success() {
        // given
        AnalysisTranslateReqDTO request = new AnalysisTranslateReqDTO("금일 피고인은 법정에 출석하지 아니하였다.", TranslationTone.DEFAULT);

        // 프롬프트 빌더 Mocking
        given(promptProvider.buildPrompt(anyString(), anyMap())).willReturn("builtUserPrompt");

        // Gemini API 응답 모킹 (구조화된 JSON 스키마를 포함한 API 원본 응답)
        String mockGeminiRawResponse = """
                {
                    "candidates": [
                        {
                            "content": {
                                "parts": [
                                    {
                                        "text": "{\\"convertedText\\": \\"오늘 피고인은 법정에 나오지 않았다.\\", \\"aiDifficultWords\\": [\\"금일\\", \\"피고인\\"]}"
                                    }
                                ]
                            }
                        }
                    ],
                    "usageMetadata": {
                        "promptTokenCount": 20,
                        "candidatesTokenCount": 30,
                        "totalTokenCount": 50
                    }
                }
                """;
        given(geminiClient.sendRequest(anyMap())).willReturn(mockGeminiRawResponse);

        // KOMORAN 형태소 분석기 Mocking
        KomoranResult mockKomoranResult = mock(KomoranResult.class);
        given(komoran.analyze(request.text())).willReturn(mockKomoranResult);
        given(mockKomoranResult.getNouns()).willReturn(List.of("금일", "피고인", "법정", "출석"));

        // when
        AnalysisTranslateResDTO response = analysisService.translateAndSearch(request);

        // then
        assertThat(response).isNotNull();
        // 1. 번역된 현대어 텍스트 검증
        assertThat(response.convertedText()).isEqualTo("오늘 피고인은 법정에 나오지 않았다.");
        
        // 2. AI가 JSON 스키마를 기반으로 추출한 어려운 단어 리스트 검증
        assertThat(response.aiDifficultWords()).containsExactlyInAnyOrder("금일", "피고인");
        
        // 3. KOMORAN 분석을 통해 원문에서 추출 및 정제된 키워드 검증
        assertThat(response.komoranKeywords()).containsExactlyInAnyOrder("금일", "피고인", "법정", "출석");
    }

    @Test
    @DisplayName("translateAndSearch - Gemini 응답에 오류가 있거나 빈 값일 때, GeminiException 예외 발생 검증")
    void translateAndSearch_ParsingError() {
        // given
        AnalysisTranslateReqDTO request = new AnalysisTranslateReqDTO("오류가 발생할 텍스트", TranslationTone.DEFAULT);

        given(promptProvider.buildPrompt(anyString(), anyMap())).willReturn("builtUserPrompt");
        
        // 잘못된 형태의 raw JSON 반환 (parts 데이터가 유효하지 않음)
        String invalidRawResponse = "{ \"invalid\": {} }";
        given(geminiClient.sendRequest(anyMap())).willReturn(invalidRawResponse);

        // when & then
        assertThatThrownBy(() -> analysisService.translateAndSearch(request))
                .isInstanceOf(GeminiException.class)
                .hasFieldOrPropertyWithValue("errorCode", GeminiErrorCode.GEMINI_PARSING_ERROR);
    }
}
