package com.heesik.backend.domain.training.service;

import com.heesik.backend.domain.training.converter.SentenceTrainingConverter;
import com.heesik.backend.domain.training.dto.request.SentenceTrainingReqDTO;
import com.heesik.backend.domain.training.dto.response.SentenceComponentResDTO;
import com.heesik.backend.domain.training.dto.response.SentenceGroupResDTO;
import com.heesik.backend.domain.training.enums.TrainingDifficulty;
import kr.co.shineware.nlp.komoran.core.Komoran;
import kr.co.shineware.nlp.komoran.model.KomoranResult;
import kr.co.shineware.nlp.komoran.model.Token;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SentenceTrainingService {

    private final Komoran komoran;
    private final SyntacticRoleAnalyzer syntacticRoleAnalyzer;

    public List<SentenceGroupResDTO> processTraining(SentenceTrainingReqDTO req) {

        String text = req.text();
        TrainingDifficulty difficulty = req.difficulty();

        // 1. 전체 텍스트 형태소 분석 수행
        KomoranResult analyzeResult = komoran.analyze(text);
        List<Token> tokens = analyzeResult.getTokenList();

        if (tokens == null || tokens.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 문장(Sentence) 단위로 토큰 분할
        List<List<Token>> sentenceTokensList = splitIntoSentences(tokens);

        // 3. 난이도별 묶음(Group) 개수 계산
        int sentencesPerGroup = getSentencesPerGroup(difficulty);

        // 4. 그룹화 및 성분 분석 진행
        List<SentenceGroupResDTO> result = new ArrayList<>();
        int groupIndex = 1;

        List<Token> currentGroupTokens = new ArrayList<>();
        int currentGroupSentenceCount = 0;
        int groupBeginIndex = -1;

        for (int i = 0; i < sentenceTokensList.size(); i++) {
            List<Token> sentenceTokens = sentenceTokensList.get(i);
            
            if (sentenceTokens.isEmpty()) continue;

            if (groupBeginIndex == -1) {
                groupBeginIndex = sentenceTokens.get(0).getBeginIndex();
            }

            currentGroupTokens.addAll(sentenceTokens);
            currentGroupSentenceCount++;

            boolean isLastSentence = (i == sentenceTokensList.size() - 1);

            if (currentGroupSentenceCount >= sentencesPerGroup || isLastSentence) {
                // 원본 텍스트 추출 (다음 문장의 시작점 전까지 포함하여 공백 유지)
                int groupEndIndex = currentGroupTokens.get(currentGroupTokens.size() - 1).getEndIndex();
                
                if (!isLastSentence) {
                     groupEndIndex = sentenceTokensList.get(i + 1).get(0).getBeginIndex();
                } else if (groupEndIndex < text.length()) {
                     groupEndIndex = text.length(); // 마지막 문장이면 문자열 끝까지 포함
                }

                String groupText = text.substring(groupBeginIndex, groupEndIndex);

                // 문장 성분 분석기 호출
                List<SentenceComponentResDTO> components = syntacticRoleAnalyzer.analyze(currentGroupTokens, text);

                result.add(SentenceTrainingConverter.toSentenceGroupResDTO(groupIndex, groupText, components));
                groupIndex++;

                // 다음 그룹을 위해 초기화
                currentGroupTokens.clear();
                currentGroupSentenceCount = 0;
                groupBeginIndex = -1;
            }
        }

        return result;
    }

    private List<List<Token>> splitIntoSentences(List<Token> tokens) {
        List<List<Token>> sentences = new ArrayList<>();
        List<Token> currentSentence = new ArrayList<>();

        for (Token token : tokens) {
            currentSentence.add(token);
            // SF(마침표, 물음표, 느낌표)를 문장 종결 기호로 인식하여 분리
            if ("SF".equals(token.getPos())) {
                sentences.add(new ArrayList<>(currentSentence));
                currentSentence.clear();
            }
        }

        if (!currentSentence.isEmpty()) {
            sentences.add(currentSentence);
        }

        return sentences;
    }

    private int getSentencesPerGroup(TrainingDifficulty difficulty) {
        return switch (difficulty) {
            case EASY -> 1;
            case NORMAL -> 3;
            case HARD -> 5;
        };
    }
}