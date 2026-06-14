package com.heesik.backend.global.security.service;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.OAuthProvider;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.security.dto.KaKaoUserDTO;
import com.heesik.backend.global.security.entity.CustomOAuth2User;
import lombok.RequiredArgsConstructor;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuthUser = super.loadUser(userRequest);

        KaKaoUserDTO dto = extractKakaoUser(
                userRequest,
                oAuthUser
        );

        User user = userRepository.findByProviderAndProviderId(dto.getProvider(), dto.getSocialUid())
                .orElseGet(() -> createUser(dto));

        return new CustomOAuth2User(
                user.getId(),
                user.getEmail(),
                user.getRole().name(),
                user.getProvider(),
                user.getProviderId()
        );
    }

    @SuppressWarnings("unchecked")
    private KaKaoUserDTO extractKakaoUser(
            OAuth2UserRequest userRequest,
            OAuth2User oAuthUser
    ) {
        OAuthProvider provider = OAuthProvider.valueOf(
                userRequest.getClientRegistration()
                        .getRegistrationId()
                        .toUpperCase()
        );

        Map<String, Object> attributes = oAuthUser.getAttributes();

        String socialUid = String.valueOf(attributes.get("id"));

        Map<String, Object> kakaoAccount =
                (Map<String, Object>) attributes.get("kakao_account");

        Map<String, Object> profile =
                (Map<String, Object>) kakaoAccount.get("profile");

        String email = (String) kakaoAccount.get("email");
        String nickname = (String) profile.get("nickname");

        if (email == null || email.isBlank()) {
            throw new UserException(UserErrorCode.SOCIAL_EMAIL_REQUIRED);
        }

        return new KaKaoUserDTO(provider, socialUid, email, nickname);
    }

    private User createUser(KaKaoUserDTO dto) {
        User user = User.builder()
                .email(dto.getEmail())
                .name(dto.getName())
                .role(Role.ROLE_USER)
                .provider(dto.getProvider())
                .providerId(dto.getSocialUid())
                .build();

        return userRepository.save(user);
    }

}
