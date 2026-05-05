package com.heesik.backend.domain.user.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.user.dto.TokenPair;
import com.heesik.backend.domain.user.dto.request.LoginReqDTO;
import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.service.AuthService;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.validation.beanvalidation.LocalValidatorFactoryBean;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    private MockMvc mockMvc;

    private ObjectMapper objectMapper = new ObjectMapper();

    @Mock
    private AuthService authService;

    @InjectMocks
    private AuthController authController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(authController)
                .setValidator(new LocalValidatorFactoryBean())
                .build();
    }

    @Test
    @DisplayName("로그인 API 성공")
    void login_Success() throws Exception {
        // given
        LoginReqDTO req = new LoginReqDTO("test@test.com", "Password123!");
        TokenPair tokenPair = new TokenPair("access_token", "refresh_token");

        given(authService.login(any(LoginReqDTO.class))).willReturn(tokenPair);

        // when & then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("access_token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("refreshToken=refresh_token")));
    }

    @Test
    @DisplayName("로그인 API 실패 - 잘못된 이메일 형식")
    void login_InvalidEmail() throws Exception {
        // given
        LoginReqDTO req = new LoginReqDTO("invalid-email", "Password123!");

        // when & then
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest()); // @Valid 에 의해 400 에러 발생
    }

    @Test
    @DisplayName("토큰 재발급 API 성공")
    void refresh_Success() throws Exception {
        // given
        Cookie cookie = new Cookie("refreshToken", "old_refresh_token");
        TokenPair tokenPair = new TokenPair("new_access_token", "new_refresh_token");

        given(authService.refresh(anyString())).willReturn(tokenPair);

        // when & then
        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").value("new_access_token"))
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("refreshToken=new_refresh_token")));
    }

    @Test
    @DisplayName("토큰 재발급 API 실패 - 쿠키 누락")
    void refresh_MissingCookie() throws Exception {
        // 쿠키 없이 요청
        mockMvc.perform(post("/api/auth/refresh"))
                .andExpect(status().isUnauthorized()); // 쿠키 없으면 401 반환 처리 로직 검증
    }

    @Test
    @DisplayName("로그아웃 API 성공")
    void logout_Success() throws Exception {
        // given
        Cookie cookie = new Cookie("refreshToken", "old_refresh_token");

        // when & then
        mockMvc.perform(post("/api/auth/logout")
                        .cookie(cookie))
                .andExpect(status().isOk())
                .andExpect(header().exists(HttpHeaders.SET_COOKIE))
                .andExpect(header().string(HttpHeaders.SET_COOKIE, org.hamcrest.Matchers.containsString("Max-Age=0"))); // 쿠키 삭제 검증

        verify(authService).logout("old_refresh_token");
    }

    @Test
    @DisplayName("회원가입 API 성공")
    void signup_Success() throws Exception {
        // given
        SignUpReqDTO req = new SignUpReqDTO("테스터", "test@test.com", "Password123!");

        // when & then
        mockMvc.perform(post("/api/auth/signup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk());

        verify(authService).createUser(any(SignUpReqDTO.class));
    }
}
