package com.heesik.backend.domain.word.service;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.word.converter.WordBookConverter;
import com.heesik.backend.domain.word.converter.WordConverter;
import com.heesik.backend.domain.word.dto.request.CreateWordBookReqDTO;
import com.heesik.backend.domain.word.dto.request.CreateWordBookWithWordsReqDTO;
import com.heesik.backend.domain.word.dto.request.UpdateWordBookReqDTO;
import com.heesik.backend.domain.word.dto.response.WordBookResDTO;
import com.heesik.backend.domain.word.dto.response.WordBookWordResDTO;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.entity.WordBook;
import com.heesik.backend.domain.word.entity.WordBookWord;
import com.heesik.backend.domain.word.repository.WordBookRepository;
import com.heesik.backend.domain.word.repository.WordBookWordRepository;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.code.WordBookErrorCode;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.error.exception.WordBookException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class WordBookService {

    private final UserRepository userRepository;
    private final WordBookRepository wordBookRepository;
    private final WordRepository wordRepository;
    private final WordBookWordRepository wordBookWordRepository;

    @Transactional(readOnly = true)
    public List<WordBookResDTO> getWordBooks(Long userId) {
        List<WordBook> wordBooks = wordBookRepository.findAllByUserIdOrderByIdDesc(userId);
        return wordBooks.stream()
                .map(WordBookConverter::toWordBookResDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<WordBookWordResDTO> getWordBookWordsWithCursor(Long wordBookId, Long lastId, int size, Long userId) {
        WordBook wordBook = wordBookRepository.findById(wordBookId)
                .orElseThrow(() -> new WordBookException(WordBookErrorCode.WORDBOOK_NOT_FOUND));

        // 단어장 소유권 확인
        if (!wordBook.getUser().getId().equals(userId)) {
            throw new WordBookException(WordBookErrorCode.WORDBOOK_ACCESS_DENIED);
        }

        // 다음 페이지 있는지 판별을 위해 요청 크기 + 1만큼 조회
        Pageable pageable = PageRequest.of(0, size + 1);
        List<WordBookWord> wordBookWords;

        if (lastId == null) {
            wordBookWords = wordBookWordRepository.findFirstPageByWordBookId(wordBookId, pageable);
        } else {
            wordBookWords = wordBookWordRepository.findByWordBookIdWithCursor(wordBookId, lastId, pageable);
        }

        return wordBookWords.stream()
                .map(WordBookConverter::toWordBookWordResDTO)
                .toList();
    }

    @Transactional
    public Long saveEmptyWordBook(CreateWordBookReqDTO request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        WordBook wordBook = WordBookConverter.toWordBook(request.title(), request.description(), user);
        
        WordBook savedWordBook = wordBookRepository.save(wordBook);
        return savedWordBook.getId();
    }

    @Transactional
    public Long saveWordBookWithWords(CreateWordBookWithWordsReqDTO request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 서버의 임의 생성 규칙에 따라 제목과 설명이 설정된 단어장 객체 생성
        WordBook wordBook = WordBookConverter.toTemporaryWordBook(user);

        // 요청으로 온 단어들을 순회하며 단어장과의 매핑 관계 설정
        request.words().forEach(wordDto -> {
            // DB에 해당 단어가 이미 저장되어 있는지 조회 후 없으면 새로 저장
            Word word = wordRepository.findByTargetCodeAndSenseNo(wordDto.targetCode(), wordDto.senseNo())
                    .orElseGet(() -> wordRepository.save(WordConverter.toWord(wordDto)));

            // 단어장과 단어 사이의 N:M 매핑 객체(WordBookWord) 생성
            WordBookWord wordBookWord = WordBookWord.builder()
                    .wordBook(wordBook)
                    .word(word)
                    .build();

            // 단어장의 연관관계 컬렉션에 추가 (생성자 내부에서 자동으로 add됨)
        });

        WordBook savedWordBook = wordBookRepository.save(wordBook);
        return savedWordBook.getId();
    }


    @Transactional
    public void updateWordBook(Long wordBookId, UpdateWordBookReqDTO request, Long userId) {
        WordBook wordBook = wordBookRepository.findById(wordBookId)
                .orElseThrow(() -> new WordBookException(WordBookErrorCode.WORDBOOK_NOT_FOUND));

        // 단어장 소유권 확인
        if (!wordBook.getUser().getId().equals(userId)) {
            throw new WordBookException(WordBookErrorCode.WORDBOOK_ACCESS_DENIED);
        }

        wordBook.updateWordBook(request.title(), request.description());
    }


    @Transactional
    public void deleteWordBook(Long wordBookId, Long userId) {
        WordBook wordBook = wordBookRepository.findById(wordBookId)
                .orElseThrow(() -> new WordBookException(WordBookErrorCode.WORDBOOK_NOT_FOUND));

        // 단어장 소유권 확인
        if (!wordBook.getUser().getId().equals(userId)) {
            throw new WordBookException(WordBookErrorCode.WORDBOOK_ACCESS_DENIED);
        }

        wordBookRepository.delete(wordBook);
    }

}
