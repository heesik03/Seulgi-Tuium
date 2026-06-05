package com.heesik.backend.domain.analysis.service;

import com.heesik.backend.domain.analysis.dto.request.UrimalsaemReqDTO;
import com.heesik.backend.domain.analysis.dto.response.UrimalsaemResDTO;
import com.heesik.backend.global.client.UrimalsaemClient;
import com.heesik.backend.global.config.CacheConfig;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.cache.CacheManager;

import java.util.Objects;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.Files;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;

@SpringBootTest
class AnalysisServiceCacheTest {

    static {
        try {
            Path envPath = Paths.get(".env");
            if (Files.exists(envPath)) {
                Files.readAllLines(envPath).forEach(line -> {
                    String trimmed = line.trim();
                    if (!trimmed.isEmpty() && !trimmed.startsWith("#") && trimmed.contains("=")) {
                        String[] parts = trimmed.split("=", 2);
                        String key = parts[0].trim();
                        String value = parts[1].trim();
                        System.setProperty(key, value);
                    }
                });
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    @Autowired
    private AnalysisService analysisService;

    @Autowired
    private CacheManager cacheManager;

    @MockitoBean
    private UrimalsaemClient urimalsaemClient;

    @BeforeEach
    void clearCache() {
        // 테스트 전후 격리를 위해 캐시 초기화
        Objects.requireNonNull(cacheManager.getCache(CacheConfig.URIMALSAEM_CACHE)).clear();
    }

    @Test
    @DisplayName("우리말샘 단어 검색 시 첫 번째 호출은 외부 API를 요청하고, 두 번째 호출부터는 캐싱된 데이터를 즉시 반환해야 한다.")
    void searchUrimalsaem_CachingBehavior() {
        // given
        UrimalsaemReqDTO request = new UrimalsaemReqDTO("나무", 1, 10);
        String mockApiResponse = """
                {
                    "channel": {
                        "total": 1,
                        "start": 1,
                        "num": 10,
                        "item": [
                            {
                                "target_code": 368281,
                                "word": "나무",
                                "sense_no": 1,
                                "definition": "줄기나 가지가 목질로 된 여러해살이 식물.",
                                "pos": "명사",
                                "link": "https://opendict.korean.go.kr/dictionary/view?sense_no=368281",
                                "type": "일반어"
                            }
                        ]
                    }
                }
                """;

        given(urimalsaemClient.search("나무", 1, 10)).willReturn(mockApiResponse);

        // when
        // 1. 첫 번째 호출 (Cache Miss -> 외부 API 호출 유발)
        UrimalsaemResDTO firstResponse = analysisService.searchUrimalsaem(request);

        // 2. 두 번째 호출 (Cache Hit -> 캐시 반환)
        UrimalsaemResDTO secondResponse = analysisService.searchUrimalsaem(request);

        // then
        // 객체 데이터 정합성 검증
        assertThat(firstResponse).isNotNull();
        assertThat(secondResponse).isNotNull();
        assertThat(firstResponse.items().get(0).word()).isEqualTo("나무");
        assertThat(secondResponse.items().get(0).word()).isEqualTo("나무");

        // 호출 횟수 검증 (실제 클라이언트 search() 호출은 단 1회여야 함)
        verify(urimalsaemClient, times(1)).search("나무", 1, 10);

        // CacheManager에 저장된 내용 직접 검증 (Jackson JSON 직렬화/역직렬화 성공 여부 검증)
        UrimalsaemResDTO cachedValue = cacheManager.getCache(CacheConfig.URIMALSAEM_CACHE)
                .get(request.q() + "_" + request.start() + "_" + request.num(), UrimalsaemResDTO.class);
        
        assertThat(cachedValue).isNotNull();
        assertThat(cachedValue.items().get(0).word()).isEqualTo("나무");
    }
}
