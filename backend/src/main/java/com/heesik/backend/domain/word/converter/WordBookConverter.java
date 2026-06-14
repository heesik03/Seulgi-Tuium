package com.heesik.backend.domain.word.converter;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.word.dto.response.WordBookResDTO;
import com.heesik.backend.domain.word.dto.response.WordBookWordResDTO;
import com.heesik.backend.domain.word.entity.WordBook;
import com.heesik.backend.domain.word.entity.WordBookWord;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

public class WordBookConverter {

    public WordBookConverter() {}

    public static WordBookResDTO toWordBookResDTO(WordBook wordBook) {
        return WordBookResDTO.builder()
                .wordBookId(wordBook.getId())
                .title(wordBook.getTitle())
                .description(wordBook.getDescription())
                .wordCount(wordBook.getWordBookWords().size())
                .createdAt(wordBook.getCreatedAt())
                .build();
    }

    public static WordBook toWordBook(String title, String description, User user) {
        return WordBook.builder()
                .title(title)
                .description(description)
                .user(user)
                .build();
    }

    public static WordBook toTemporaryWordBook(User user) {
        LocalDateTime now = LocalDateTime.now();
        String formattedDate = now.format(DateTimeFormatter.ofPattern("yyyy년 MM월 dd일 HH시 mm분"));
        
        String title = now.format(DateTimeFormatter.ofPattern("yyyy-MM-dd")) + " 추천 단어장";
        String description = formattedDate + "에 생성된 단어장";

        return WordBook.builder()
                .title(title)
                .description(description)
                .user(user)
                .build();
    }

    public static WordBookWordResDTO toWordBookWordResDTO(WordBookWord wordBookWord) {
        return WordBookWordResDTO.builder()
                .wordBookWordId(wordBookWord.getId())
                .addedAt(wordBookWord.getAddedAt())
                .UrimalsaemItem(
                        UrimalsaemItem.builder()
                                .word(wordBookWord.getWord().getExpression())
                                .targetCode(wordBookWord.getWord().getTargetCode())
                                .senseNo(wordBookWord.getWord().getSenseNo())
                                .definition(wordBookWord.getWord().getMeaning())
                                .pos(wordBookWord.getWord().getPos())
                                .link(wordBookWord.getWord().getLink())
                                .type(wordBookWord.getWord().getType())
                                .build()
                )
                .build();
    }
}
