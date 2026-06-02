package com.heesik.backend.domain.training.service;

import com.heesik.backend.domain.training.dto.response.SentenceComponentResDTO;
import com.heesik.backend.domain.training.enums.SyntacticRole;
import kr.co.shineware.nlp.komoran.model.Token;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Component
public class SyntacticRoleAnalyzer {

    private static final Set<String> KEYWORD_POS = Set.of(
            "NNG", "NNP", "VV", "VA", "XR", "MAG", "MM"
    );

    // 문장 토큰들을 어절(띄어쓰기) 단위 또는 성분 단위로 분할하여 분석합니다.
    public List<SentenceComponentResDTO> analyze(List<Token> sentenceTokens, String fullText) {
        List<SentenceComponentResDTO> components = new ArrayList<>();
        
        List<Token> currentChunkTokens = new ArrayList<>();
        List<String> currentKeywords = new ArrayList<>();
        
        int chunkBeginIndex = -1;

        for (int i = 0; i < sentenceTokens.size(); i++) {
            Token token = sentenceTokens.get(i);
            if (chunkBeginIndex == -1) {
                chunkBeginIndex = token.getBeginIndex();
            }

            currentChunkTokens.add(token);
            collectKeyword(currentKeywords, token);

            // 다음 토큰 확인하여 분할 지점인지 체크 (띄어쓰기 기준 등)
            boolean isBoundary = false;
            
            if (i == sentenceTokens.size() - 1) {
                isBoundary = true; // 마지막 토큰이면 무조건 경계
            } else {
                Token nextToken = sentenceTokens.get(i + 1);
                // 원본 텍스트상에서 토큰과 다음 토큰 사이에 공백이 있는지 확인
                if (token.getEndIndex() < nextToken.getBeginIndex()) {
                    isBoundary = true;
                }
                
                // 보조용언(VX), 어미(E) 등이 띄어쓰기로 분리되어 있어도 같은 서술어 묶음으로 처리하기 위해 경계 무시
                if (isBoundary) {
                    if (nextToken.getPos().startsWith("VX") || nextToken.getPos().startsWith("E") || nextToken.getPos().startsWith("X")) {
                        isBoundary = false;
                    }
                }
            }

            if (isBoundary) {
                int chunkEndIndex = token.getEndIndex();
                
                // 공백 포함 로직 (원본 텍스트 기반)
                if (i < sentenceTokens.size() - 1) {
                    chunkEndIndex = sentenceTokens.get(i + 1).getBeginIndex();
                }

                String chunkText = fullText.substring(chunkBeginIndex, chunkEndIndex);

                SyntacticRole role = determineRole(currentChunkTokens);

                components.add(SentenceComponentResDTO.builder()
                        .text(chunkText)
                        .keywords(new ArrayList<>(currentKeywords))
                        .role(role)
                        .roleDescription(role.getDescription())
                        .build());

                // 초기화
                currentChunkTokens.clear();
                currentKeywords.clear();
                chunkBeginIndex = -1;
            }
        }

        return components;
    }

    private SyntacticRole determineRole(List<Token> chunkTokens) {
        boolean hasSubjectMarker = false;
        boolean hasObjectMarker = false;
        boolean hasAdverbialMarker = false;
        boolean hasPredicateEnd = false;
        boolean hasModifierMarker = false;
        boolean hasComplementMarker = false;

        boolean isPredicateCore = false; // 동사/형용사 존재 여부

        // 역순으로 조사/어미를 먼저 확인하는 것이 역할 판단에 유리함
        for (int i = chunkTokens.size() - 1; i >= 0; i--) {
            Token token = chunkTokens.get(i);
            String pos = token.getPos();
            String morph = token.getMorph();

            // 주격 조사(JKS), 보조사(JX - 은/는) 등 역할 분석 (Java 21 switch 패턴 매칭)
            switch (pos) {
                case "JKS" -> {
                    if ("이".equals(morph) || "가".equals(morph) || "께서".equals(morph)) hasSubjectMarker = true;
                }
                case "JX" -> {
                    if ("은".equals(morph) || "는".equals(morph)) hasSubjectMarker = true;
                }
                case "JKO" -> hasObjectMarker = true; // 목적격 조사
                case "JKB", "MAG" -> hasAdverbialMarker = true; // 부사격 조사, 일반 부사
                case "JKG", "MM" -> hasModifierMarker = true; // 관형격 조사, 관형사
                case "JKC" -> hasComplementMarker = true; // 보격 조사
                case "EF", "EP" -> hasPredicateEnd = true; // 종결 어미, 선어말 어미
                case "MAJ" -> { return SyntacticRole.CONJUNCTION; } // 접속 부사
                case "IC" -> { return SyntacticRole.INDEPENDENT; } // 감탄사
                case String p when p.startsWith("VV") || p.startsWith("VA") -> isPredicateCore = true; // 동사, 형용사
                default -> {}
            }
        }

        if (hasPredicateEnd || isPredicateCore) {
            // 관형형 전성어미(ETM)로 끝나면 관형어
            Token lastImportantToken = getLastImportantToken(chunkTokens);
            if (lastImportantToken != null && "ETM".equals(lastImportantToken.getPos())) {
                return SyntacticRole.MODIFIER;
            }
            // 명사형 전성어미(ETN)로 끝나면 추가 조사 확인 필요 (여기선 간략화)
            return SyntacticRole.PREDICATE;
        }

        if (hasComplementMarker) return SyntacticRole.COMPLEMENT;
        if (hasSubjectMarker) return SyntacticRole.SUBJECT;
        if (hasObjectMarker) return SyntacticRole.OBJECT;
        if (hasAdverbialMarker) return SyntacticRole.ADVERBIAL;
        if (hasModifierMarker) return SyntacticRole.MODIFIER;

        return SyntacticRole.UNKNOWN;
    }

    private Token getLastImportantToken(List<Token> chunkTokens) {
        for (int i = chunkTokens.size() - 1; i >= 0; i--) {
            String pos = chunkTokens.get(i).getPos();
            if (!"SF".equals(pos) && !"SP".equals(pos) && !"SS".equals(pos) && !"SE".equals(pos) && !"SO".equals(pos)) {
                return chunkTokens.get(i);
            }
        }
        return null;
    }

    private void collectKeyword(List<String> keywords, Token token) {
        String pos = token.getPos();
        String morph = token.getMorph();

        if (KEYWORD_POS.contains(pos)) {
            if (!keywords.contains(morph)) {
                keywords.add(morph);
            }
        }
    }
}
