package com.heesik.backend.domain.user.converter;

import com.heesik.backend.domain.user.dto.request.SignUpReqDTO;
import com.heesik.backend.domain.user.dto.response.TokenResDTO;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;

public class UserConverter {

    public UserConverter() {}

    public static User touser(SignUpReqDTO request, String encodedPassword) {
        return User.builder()
                .name(request.userName())
                .email(request.email())
                .password(encodedPassword)
                .role(Role.ROLE_USER)
                .build();
    }

    public static TokenResDTO toTokenResDTO(String accessToken, String tokenType) {
        return TokenResDTO.builder()
                .accessToken(accessToken)
                .tokenType(tokenType)
                .build();
    }

    public static com.heesik.backend.domain.user.dto.response.MyPageResDTO toMyPageResDTO(User user) {
        return com.heesik.backend.domain.user.dto.response.MyPageResDTO.builder()
                .email(user.getEmail())
                .name(user.getName())
                .role(user.getRole())
                .provider(user.getProvider())
                .wordBookCount(user.getWordBooks().size())
                .favoriteWordCount(user.getFavoriteWords().size())
                .quizCount(user.getQuizzes().size())
                .build();
    }

}
