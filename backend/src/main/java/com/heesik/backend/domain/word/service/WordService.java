package com.heesik.backend.domain.word.service;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.word.converter.WordConverter;
import com.heesik.backend.domain.word.dto.request.AddWordReqDTO;
import com.heesik.backend.domain.word.dto.response.FavoriteWordResDTO;
import com.heesik.backend.domain.word.entity.FavoriteWord;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.repository.FavoriteWordRepository;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.global.error.code.FavoriteWordErrorCode;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.FavoriteWordException;
import com.heesik.backend.global.error.exception.UserException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WordService {

    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private final FavoriteWordRepository favoriteWordRepository;

    @Transactional(readOnly = true)
    public List<FavoriteWordResDTO> getFavoriteWordByUserId(Long lastId, int size, Long userId) {
        Pageable pageable = PageRequest.of(0, size + 1);
        List<FavoriteWord> favoriteWords;

        if (lastId == null) {
            favoriteWords = favoriteWordRepository.findFirstPageByUserId(userId, pageable);
        } else {
            favoriteWords = favoriteWordRepository.findByUserIdWithCursor(userId, lastId, pageable);
        }

        return favoriteWords.stream()
                .map(WordConverter::toFavoriteWordResDTO)
                .toList();
    }


    @Transactional
    public Long saveWordAndWordFavorites(AddWordReqDTO request, Long userId) {
        // 단어의 Unique 제약조건(targetCode, senseNo)과 사용자 ID 기준으로 이미 찜한 단어인지 사전 검사
        if (favoriteWordRepository.existsByUserIdAndWordTargetCodeAndWordSenseNo(userId, request.targetCode(), request.senseNo())) {
            throw new FavoriteWordException(FavoriteWordErrorCode.FAVORITE_WORD_ALREADY_EXISTS);
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        Word word = wordRepository.findByTargetCodeAndSenseNo(
                        request.targetCode(),
                        request.senseNo()
                )
                .orElseGet(() ->
                        wordRepository.save(
                                WordConverter.toWord(request)
                        )
                );

        FavoriteWord favoriteWord = favoriteWordRepository.save(
                WordConverter.toFavoriteWord(user, word)
        );

        return favoriteWord.getId();
    }

    /**
     * 즐겨찾기 등록을 취소(삭제)합니다.
     * 취소 대상 즐겨찾기가 현재 로그인 유저의 것이 맞는지 확인하여 권한을 검증합니다.
     * 
     * @param favoriteWordId 취소할 즐겨찾기 ID
     * @param userId 회원 고유 ID
     */
    @Transactional
    public void deleteFavoriteWord(Long favoriteWordId, Long userId) {
        FavoriteWord favoriteWord = favoriteWordRepository.findById(favoriteWordId)
                .orElseThrow(() -> new FavoriteWordException(FavoriteWordErrorCode.FAVORITE_WORD_NOT_FOUND));

        // 즐겨찾기 소유권 검증
        if (!favoriteWord.getUser().getId().equals(userId)) {
            throw new FavoriteWordException(FavoriteWordErrorCode.FAVORITE_WORD_ACCESS_DENIED);
        }

        favoriteWordRepository.delete(favoriteWord);
    }

}
