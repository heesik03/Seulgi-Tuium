package com.heesik.backend.domain.word.converter;

import com.heesik.backend.domain.analysis.dto.UrimalsaemItem;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.word.dto.request.AddWordReqDTO;
import com.heesik.backend.domain.word.dto.response.FavoriteWordResDTO;
import com.heesik.backend.domain.word.entity.FavoriteWord;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.global.util.WordUtil;

public class WordConverter {

    public WordConverter() {}

    public static FavoriteWordResDTO toFavoriteWordResDTO(FavoriteWord favoriteWord) {
        return FavoriteWordResDTO.builder()
                .favoriteWordId(favoriteWord.getId())
                .addedAt(favoriteWord.getAddedAt())
                .UrimalsaemItem(
                        UrimalsaemItem.builder()
                                .word(favoriteWord.getWord().getExpression())
                                .targetCode(favoriteWord.getWord().getTargetCode())
                                .senseNo(favoriteWord.getWord().getSenseNo())
                                .definition(favoriteWord.getWord().getMeaning())
                                .pos(favoriteWord.getWord().getPos())
                                .link(favoriteWord.getWord().getLink())
                                .type(favoriteWord.getWord().getType())
                                .build()
                )
                .build();
    }

    public static Word toWord(AddWordReqDTO addWordReqDTO) {
        return Word.builder()
                .expression(WordUtil.cleanWord(addWordReqDTO.word()))
                .targetCode(addWordReqDTO.targetCode())
                .senseNo(addWordReqDTO.senseNo())
                .meaning(addWordReqDTO.definition())
                .pos(addWordReqDTO.pos())
                .link(addWordReqDTO.link())
                .type(addWordReqDTO.type())
                .build();
    }

    public static FavoriteWord toFavoriteWord(User user, Word word) {
        return FavoriteWord.builder()
                .user(user)
                .word(word)
                .build();
    }

}
