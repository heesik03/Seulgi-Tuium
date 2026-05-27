package com.heesik.backend.domain.word.repository;

import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.enums.Role;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.word.entity.FavoriteWord;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.entity.WordBook;
import com.heesik.backend.domain.word.entity.WordBookWord;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(properties = {
        "spring.jpa.hibernate.ddl-auto=create-drop"
})
@Transactional
class WordDomainMappingTest {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private WordRepository wordRepository;

    @Autowired
    private WordBookRepository wordBookRepository;

    @Autowired
    private WordBookWordRepository wordBookWordRepository;

    @Autowired
    private FavoriteWordRepository favoriteWordRepository;

    @Test
    @DisplayName("단어(Word) 엔티티 저장 및 신규 추가 컬럼 검증")
    void saveAndFindWord_Success() {
        // given
        Word word = Word.builder()
                .expression("apple")
                .targetCode(368281L)
                .senseNo(1)
                .meaning("사과")
                .pos("noun")
                .link("https://opendict.korean.go.kr/dictionary/view?sense_no=368281")
                .type("일반어")
                .build();

        // when
        Word savedWord = wordRepository.save(word);

        // then
        assertThat(savedWord.getId()).isNotNull();
        assertThat(savedWord.getExpression()).isEqualTo("apple");
        assertThat(savedWord.getTargetCode()).isEqualTo(368281L);
        assertThat(savedWord.getSenseNo()).isEqualTo(1);
        assertThat(savedWord.getMeaning()).isEqualTo("사과");
        assertThat(savedWord.getPos()).isEqualTo("noun");
        assertThat(savedWord.getLink()).isEqualTo("https://opendict.korean.go.kr/dictionary/view?sense_no=368281");
        assertThat(savedWord.getType()).isEqualTo("일반어");
    }

    @Test
    @DisplayName("단어장(WordBook) 생성 및 User 연관관계 검증")
    void saveWordBook_Success() {
        // given
        User user = User.builder()
                .email("testword@test.com")
                .password("password123!")
                .name("테스터")
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);

        WordBook wordBook = WordBook.builder()
                .title("토익 영단어")
                .description("토익 고득점을 위한 필수 영단어장")
                .user(savedUser)
                .build();

        // when
        WordBook savedWordBook = wordBookRepository.save(wordBook);

        // then
        assertThat(savedWordBook.getId()).isNotNull();
        assertThat(savedWordBook.getTitle()).isEqualTo("토익 영단어");
        assertThat(savedWordBook.getUser().getId()).isEqualTo(savedUser.getId());
        assertThat(savedWordBook.getCreatedAt()).isBeforeOrEqualTo(LocalDateTime.now());
    }

    @Test
    @DisplayName("단어장에 단어 매핑(WordBookWord) 저장 및 addedAt 자동 생성 검증")
    void saveWordBookWord_Success() {
        // given
        User user = User.builder()
                .email("mapping@test.com")
                .password("password123!")
                .name("매핑테스터")
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);

        WordBook wordBook = WordBook.builder()
                .title("기초 영단어")
                .description("초급 단어장")
                .user(savedUser)
                .build();
        WordBook savedWordBook = wordBookRepository.save(wordBook);

        Word word = Word.builder()
                .expression("banana")
                .targetCode(10002L)
                .senseNo(1)
                .meaning("바나나")
                .build();
        Word savedWord = wordRepository.save(word);

        WordBookWord wordBookWord = WordBookWord.builder()
                .wordBook(savedWordBook)
                .word(savedWord)
                .build();

        // when
        WordBookWord savedMapping = wordBookWordRepository.save(wordBookWord);

        // then
        assertThat(savedMapping.getId()).isNotNull();
        assertThat(savedMapping.getWordBook().getId()).isEqualTo(savedWordBook.getId());
        assertThat(savedMapping.getWord().getId()).isEqualTo(savedWord.getId());
        assertThat(savedMapping.getAddedAt()).isNotNull();
    }

    @Test
    @DisplayName("즐겨찾기 단어(FavoriteWord) 저장 및 addedAt 자동 생성 검증")
    void saveFavoriteWord_Success() {
        // given
        User user = User.builder()
                .email("favorite@test.com")
                .password("password123!")
                .name("즐겨찾기테스터")
                .role(Role.ROLE_USER)
                .build();
        User savedUser = userRepository.save(user);

        Word word = Word.builder()
                .expression("orange")
                .targetCode(10003L)
                .senseNo(1)
                .meaning("오렌지")
                .build();
        Word savedWord = wordRepository.save(word);

        FavoriteWord favoriteWord = FavoriteWord.builder()
                .user(savedUser)
                .word(savedWord)
                .build();

        // when
        FavoriteWord savedFavorite = favoriteWordRepository.save(favoriteWord);

        // then
        assertThat(savedFavorite.getId()).isNotNull();
        assertThat(savedFavorite.getUser().getId()).isEqualTo(savedUser.getId());
        assertThat(savedFavorite.getWord().getId()).isEqualTo(savedWord.getId());
        assertThat(savedFavorite.getAddedAt()).isNotNull();
    }
}
