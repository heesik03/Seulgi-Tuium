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
    private final GeminiSemanticAnalyzer geminiSemanticAnalyzer;

    // 전체 텍스트를 난이도에 맞게 문장 단위로 그룹화하고 의미를 분석해 반환함
    public List<SentenceGroupResDTO> processTraining(SentenceTrainingReqDTO req) {

        String text = req.text();
        TrainingDifficulty difficulty = req.difficulty();

        // 1. KOMORAN을 이용해 전체 텍스트의 형태소를 분석해서 토큰 단위로 쪼갬
        KomoranResult analyzeResult = komoran.analyze(text);
        List<Token> tokens = analyzeResult.getTokenList();

        if (tokens == null || tokens.isEmpty()) {
            return new ArrayList<>();
        }

        // 2. 분석된 토큰을 마침표 등 종결 기호(SF) 기준으로 문장별로 다시 나눔
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
                groupBeginIndex = sentenceTokens.getFirst().getBeginIndex();
            }

            currentGroupTokens.addAll(sentenceTokens);
            currentGroupSentenceCount++;

            boolean isLastSentence = (i == sentenceTokensList.size() - 1);

            if (currentGroupSentenceCount >= sentencesPerGroup || isLastSentence) {
                // 원본 텍스트 추출 (띄어쓰기 등 원본 공백을 그대로 유지하기 위해 다음 문장 시작점 직전까지 자르는 복잡한 인덱스 계산임)
                int groupEndIndex = currentGroupTokens.getLast().getEndIndex();
                
                if (!isLastSentence) {
                     groupEndIndex = sentenceTokensList.get(i + 1).getFirst().getBeginIndex();
                } else if (groupEndIndex < text.length()) {
                     groupEndIndex = text.length(); // 마지막 문장이면 문자열 끝까지 포함
                }

                String groupText = text.substring(groupBeginIndex, groupEndIndex);

                // 나눈 문장 그룹 텍스트를 Gemini AI에 보내서 의미 기반 성분 분석 결과를 받아옴
                List<SentenceComponentResDTO> components = geminiSemanticAnalyzer.analyze(groupText);

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

    // 형태소 토큰 목록을 종결 기호(SF)를 기준으로 문장 단위의 리스트로 나눔
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

    // 난이도(EASY, NORMAL, HARD)에 따라 한 그룹에 들어갈 문장 개수를 정함
    private int getSentencesPerGroup(TrainingDifficulty difficulty) {
        return switch (difficulty) {
            case EASY -> 1;
            case NORMAL -> 3;
            case HARD -> 5;
        };
    }
}