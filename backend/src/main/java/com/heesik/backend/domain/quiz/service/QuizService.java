package com.heesik.backend.domain.quiz.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.heesik.backend.domain.quiz.converter.QuizConverter;
import com.heesik.backend.domain.quiz.converter.QuizHistoryConverter;
import com.heesik.backend.domain.quiz.dto.request.QuizHistoryReqDTO;
import com.heesik.backend.domain.quiz.dto.response.QuizHistoryResDTO;
import com.heesik.backend.domain.quiz.dto.request.QuizReqDTO;
import com.heesik.backend.domain.quiz.dto.response.QuizResDTO;
import com.heesik.backend.domain.quiz.dto.request.QuizUpdateReqDTO;
import com.heesik.backend.domain.quiz.entity.Quiz;
import com.heesik.backend.domain.quiz.entity.QuizHistory;
import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import com.heesik.backend.domain.quiz.entity.QuizUserAnswer;
import com.heesik.backend.domain.quiz.repository.QuizHistoryRepository;
import com.heesik.backend.domain.quiz.repository.QuizRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.domain.word.entity.Word;
import com.heesik.backend.domain.word.repository.WordRepository;
import com.heesik.backend.global.error.code.QuizErrorCode;
import com.heesik.backend.global.error.code.UserErrorCode;
import com.heesik.backend.global.error.exception.QuizException;
import com.heesik.backend.global.error.exception.UserException;
import com.heesik.backend.global.client.GeminiClient;
import com.heesik.backend.global.dto.CursorResponseDTO;
import com.heesik.backend.global.util.GeminiRequestBuilder;
import com.heesik.backend.global.util.GeminiResponseParser;
import com.heesik.backend.global.util.PromptProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional(readOnly = true)
public class QuizService {

    private final QuizRepository quizRepository;
    private final QuizHistoryRepository quizHistoryRepository;
    private final UserRepository userRepository;
    private final WordRepository wordRepository;
    private final GeminiClient geminiClient;
    private final ObjectMapper objectMapper;
    private final PromptProvider promptProvider;

    // 새로운 퀴즈 생성
    @Transactional
    public QuizResDTO createQuiz(Long userId, QuizReqDTO reqDTO) {
        // 유저 정보 조회 및 예외 처리
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new UserException(UserErrorCode.USER_NOT_FOUND));

        // 요청한 단어 개수에 따른 제목 동적 생성
        String title;
        if (reqDTO.words().size() == 1) {
            title = reqDTO.words().getFirst() + " 단어 퀴즈";
        } else {
            title = reqDTO.words().getFirst() + " 외 " + (reqDTO.words().size() - 1) + "개의 단어 퀴즈";
        }
        Quiz quiz = QuizConverter.toQuizEntity(title, user);

        // Gemini API용 시스템 및 유저 프롬프트 준비
        String systemInstruction = promptProvider.loadPrompt("prompts/quiz_creation_system.txt");
        Map<String, Object> schema = Map.of(
            "type", "ARRAY",
            "items", Map.of(
                "type", "OBJECT",
                "properties", Map.of(
                    "word", Map.of("type", "STRING"),
                    "questionText", Map.of("type", "STRING"),
                    "correctAnswer", Map.of(
                        "type", "STRING",
                        "enum", List.of("1", "2", "3", "4")
                    ),
                    "options", Map.of(
                        "type", "ARRAY",
                        "items", Map.of("type", "STRING")
                    )
                ),
                "required", List.of("word", "questionText", "correctAnswer", "options")
            )
        );

        String userPromptTemplate = promptProvider.loadPrompt("prompts/quiz_creation_user.txt");
        
        // DB에서 단어 뜻 조회
        List<Word> wordEntities = wordRepository.findByExpressionIn(reqDTO.words());
        String wordsWithMeanings = reqDTO.words().stream()
                .map(wordStr -> {
                    String meaning = wordEntities.stream()
                            .filter(w -> w.getExpression().equals(wordStr))
                            .map(Word::getMeaning)
                            .findFirst()
                            .orElse("뜻 없음");
                    return wordStr + " (뜻: " + meaning + ")";
                })
                .collect(Collectors.joining(", "));

        String prompt = promptProvider.buildPrompt(userPromptTemplate, Map.of("words", wordsWithMeanings));
        Map<String, Object> requestBody = GeminiRequestBuilder.buildStructuredOutputBody(systemInstruction, prompt, schema);

        // API 호출 및 퀴즈 내용 JSON 파싱
        String response = geminiClient.sendRequest(requestBody);
        JsonNode jsonNode = GeminiResponseParser.extractStructuredOutput(response, objectMapper);

        // 응답 누락 예외 처리
        if (jsonNode == null || jsonNode.isEmpty()) {
            throw new QuizException(QuizErrorCode.QUIZ_GENERATION_FAILED);
        }

        // 응답 데이터 기반 퀴즈 문제 엔티티 생성
        for (JsonNode item : jsonNode) {
            String word = item.get("word").asText();
            String questionText = item.get("questionText").asText();
            String correctAnswer = item.get("correctAnswer").asText();
            String options = item.get("options").toString();

            QuizConverter.toQuizQuestionEntity(quiz, word, questionText, correctAnswer, options);
        }

        // 퀴즈 엔티티 DB 저장 및 DTO 변환
        Quiz savedQuiz = quizRepository.save(quiz);
        return QuizConverter.toQuizResDTO(savedQuiz);
    }

    // 특정 퀴즈 상세 정보 조회
    public QuizResDTO getQuiz(Long userId, Long quizId) {
        // 퀴즈 및 문제 목록 Fetch Join 조회 및 예외 처리
        Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_NOT_FOUND));

        // 퀴즈 소유자 권한 검증
        validateQuizOwner(quiz, userId);

        // 조회된 퀴즈 DTO 변환
        return QuizConverter.toQuizResDTO(quiz);
    }

    // 퀴즈 목록 커서 기반 페이징 조회
    public CursorResponseDTO<QuizResDTO> getQuizList(Long userId, Long cursorId, int size) {
        // 다음 페이지 유무 판별을 위해 size + 1건 조회
        List<Quiz> quizzes = quizRepository.findQuizzesByUserIdAndCursorId(userId, cursorId, PageRequest.of(0, size + 1));
        
        // 다음 페이지 존재 시 추가 조회된 마지막 데이터 제거
        boolean hasNext = quizzes.size() > size;
        if (hasNext) {
            quizzes.remove(size);
        }

        List<QuizResDTO> content = quizzes.stream()
                .map(QuizConverter::toQuizResDTO)
                .collect(Collectors.toList());

        Long nextCursor = hasNext ? quizzes.get(size - 1).getId() : null;

        return CursorResponseDTO.of(content, nextCursor, hasNext);
    }

    // 퀴즈 삭제
    @Transactional
    public void deleteQuiz(Long userId, Long quizId) {
        // 퀴즈 조회 및 예외 처리
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_NOT_FOUND));
        
        // 퀴즈 소유자 권한 검증
        validateQuizOwner(quiz, userId);
        quizRepository.delete(quiz);
    }

    // 퀴즈 제목 수정
    @Transactional
    public QuizResDTO updateQuizTitle(Long userId, Long quizId, QuizUpdateReqDTO reqDTO) {
        // 퀴즈 조회 및 예외 처리
        Quiz quiz = quizRepository.findById(quizId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_NOT_FOUND));

        // 퀴즈 소유자 권한 검증
        validateQuizOwner(quiz, userId);

        // 퀴즈 제목 변경
        quiz.updateTitle(reqDTO.title());

        return QuizConverter.toQuizResDTO(quiz);
    }


    // 퀴즈 채점 및 결과 저장
    @Transactional
    public QuizHistoryResDTO submitQuiz(Long quizId, QuizHistoryReqDTO reqDTO) {
        // 제출 대상 퀴즈 및 문제 목록 조회
        Quiz quiz = quizRepository.findByIdWithQuestions(quizId)
                .orElseThrow(() -> new QuizException(QuizErrorCode.QUIZ_NOT_FOUND));

        // 채점 로직 효율화를 위한 문제 ID 기반 Map 생성
        Map<Long, QuizQuestion> questionMap = quiz.getQuizQuestions().stream()
                .collect(Collectors.toMap(QuizQuestion::getId, q -> q));

        // 실제 DB 문제 개수 기준 ZeroDivision 방어 로직
        int totalQuestions = quiz.getQuizQuestions().size();
        if (totalQuestions == 0) {
            throw new QuizException(QuizErrorCode.QUIZ_EMPTY_QUESTIONS);
        }

        // 단일 순회: 유효성 검증 + 채점 + 중간 결과 수집
        List<GradedAnswer> gradedAnswers = new ArrayList<>();
        int correctCount = 0;

        for (QuizHistoryReqDTO.AnswerSubmitDTO answerDTO : reqDTO.answers()) {
            QuizQuestion question = questionMap.get(answerDTO.questionId());
            if (question == null) {
                throw new QuizException(QuizErrorCode.QUIZ_QUESTION_NOT_FOUND);
            }
            boolean isCorrect = question.getCorrectAnswer().equals(answerDTO.submittedAnswer());
            if (isCorrect) correctCount++;
            gradedAnswers.add(new GradedAnswer(question, answerDTO.submittedAnswer(), isCorrect));
        }

        // 총 문제 수 대비 정답 수 백분율 점수 계산
        int score = (int) Math.round((double) correctCount / totalQuestions * 100);

        // 퀴즈 풀이 이력 엔티티 생성
        QuizHistory finalHistory = QuizHistoryConverter.toQuizHistoryEntity(quiz, score, LocalDateTime.now());

        // 채점 결과 기반 풀이 기록 엔티티 생성
        for (GradedAnswer graded : gradedAnswers) {
            QuizHistoryConverter.toQuizUserAnswerEntity(finalHistory, graded.question(), graded.submittedAnswer(), graded.isCorrect());
        }

        // 풀이 이력 DB 저장 및 결과 DTO 변환
        QuizHistory savedHistory = quizHistoryRepository.save(finalHistory);
        return QuizHistoryConverter.toQuizHistoryResDTO(savedHistory);
    }

    // 퀴즈 소유자 권한 검증 공통 메서드
    private void validateQuizOwner(Quiz quiz, Long userId) {
        if (!quiz.getUser().getId().equals(userId)) {
            throw new QuizException(QuizErrorCode.QUIZ_ACCESS_DENIED);
        }
    }

    record GradedAnswer(QuizQuestion question, String submittedAnswer, boolean isCorrect) {}

}
