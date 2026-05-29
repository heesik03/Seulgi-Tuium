package com.heesik.backend.domain.user.service.core;

import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Slf4j
@Service
@RequiredArgsConstructor
public class KakaoUnlinkService {

    private final RestClient restClient;

    @Value("${kakao.admin-key}")
    private String adminKey;

    @Value("${kakao.unlink-url}")
    private String unlinkUrl;

    public void unlink(String providerId) {
        try {
            restClient.post()
                    .uri(unlinkUrl)
                    .header(HttpHeaders.AUTHORIZATION, "KakaoAK " + adminKey)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body("target_id_type=user_id&target_id=" + providerId)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.error("Kakao unlink failed. providerId={}", providerId, e);
            throw new UserException(UserErrorCode.KAKAO_UNLINK_FAILED);
        }
    }

}