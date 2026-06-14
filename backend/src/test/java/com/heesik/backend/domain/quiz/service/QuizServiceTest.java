package com.heesik.backend.domain.quiz.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.heesik.backend.domain.quiz.converter.QuizConverter;
import com.heesik.backend.domain.quiz.converter.QuizHistoryConverter;
import com.heesik.backend.domain.quiz.dto.request.QuizHistoryReqDTO;
import com.heesik.backend.domain.quiz.dto.request.QuizReqDTO;
import com.heesik.backend.domain.quiz.entity.Quiz;
import com.heesik.backend.domain.quiz.entity.QuizHistory;
import com.heesik.backend.domain.quiz.entity.QuizQuestion;
import com.heesik.backend.domain.quiz.repository.QuizHistoryRepository;
import com.heesik.backend.domain.quiz.repository.QuizRepository;
import com.heesik.backend.domain.user.entity.User;
import com.heesik.backend.domain.user.repository.UserRepository;
import com.heesik.backend.global.client.GeminiClient;
import com.heesik.backend.global.util.GeminiResponseParser;
import com.heesik.backend.global.util.PromptProvider;
import com.heesik.backend.global.error.exception.QuizException;
import com.heesik.backend.global.error.code.QuizErrorCode;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuizServiceTest {

    @InjectMocks
    private QuizService quizService;

    @Mock private QuizRepository quizRepository;
    @Mock private QuizHistoryRepository quizHistoryRepository;
    @Mock private UserRepository userRepository;
    @Mock private GeminiClient geminiClient;
    @Spy private ObjectMapper objectMapper = new ObjectMapper();
    @Mock private PromptProvider promptProvider;

    @Test
    @DisplayName("submitQuiz - 사용자의 답안을 채점하여 퀴즈 이력과 교차 엔티티(QuizUserAnswer)가 올바르게 생성되는지 검증")
    void submitQuiz_success() {
        // given
        Long userId = 1L;
        Long quizId = 1L;

        User user = mock(User.class);
        ReflectionTestUtils.setField(user, "id", userId);

        Quiz quiz = Quiz.builder().title("테스트 퀴즈").user(user).build();
        ReflectionTestUtils.setField(quiz, "id", quizId);

        QuizQuestion q1 = QuizQuestion.builder().quiz(quiz).word("사과").questionText("사과 뜻?").correctAnswer("1").options("[]").build();
        QuizQuestion q2 = QuizQuestion.builder().quiz(quiz).word("바나나").questionText("바나나 뜻?").correctAnswer("2").options("[]").build();
        QuizQuestion q3 = QuizQuestion.builder().quiz(quiz).word("포도").questionText("포도 뜻?").correctAnswer("3").options("[]").build();
        QuizQuestion q4 = QuizQuestion.builder().quiz(quiz).word("수박").questionText("수박 뜻?").correctAnswer("4").options("[]").build();
        
        ReflectionTestUtils.setField(q1, "id", 101L);
        ReflectionTestUtils.setField(q2, "id", 102L);
        ReflectionTestUtils.setField(q3, "id", 103L);
        ReflectionTestUtils.setField(q4, "id", 104L);

        ReflectionTestUtils.setField(quiz, "quizQuestions", List.of(q1, q2, q3, q4));

        when(quizRepository.findByIdWithQuestions(quizId)).thenReturn(Optional.of(quiz));

        // 2개 정답, 2개 오답 (총 4문제 중 2문제 정답 -> 50점)
        List<QuizHistoryReqDTO.AnswerSubmitDTO> answers = List.of(
                new QuizHistoryReqDTO.AnswerSubmitDTO(101L, "1"), // 정답
                new QuizHistoryReqDTO.AnswerSubmitDTO(102L, "2"), // 정답
                new QuizHistoryReqDTO.AnswerSubmitDTO(103L, "1"), // 오답
                new QuizHistoryReqDTO.AnswerSubmitDTO(104L, "2")  // 오답
        );
        QuizHistoryReqDTO reqDTO = new QuizHistoryReqDTO(answers);

        when(quizHistoryRepository.save(any(QuizHistory.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // when
        quizService.submitQuiz(quizId, reqDTO);

        // then
        verify(quizHistoryRepository, times(1)).save(argThat(history -> {
            assertThat(history.getScore()).isEqualTo(50); // 50점 검증
            assertThat(history.getQuiz().getId()).isEqualTo(quizId);
            
            // 다대다 교차 엔티티 (QuizUserAnswer) 검증
            assertThat(history.getQuizUserAnswers()).hasSize(4);
            long correctCount = history.getQuizUserAnswers().stream().filter(a -> a.getIsCorrect()).count();
            assertThat(correctCount).isEqualTo(2);

            return true;
        }));
    }

    @Test
    @DisplayName("createQuiz - GeminiClient를 호출하여 Structured Output 기반 파싱 및 퀴즈가 올바르게 생성되는지 검증")
    void createQuiz_success() {
        // given
        Long userId = 1L;
        User user = mock(User.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        QuizReqDTO reqDTO = new QuizReqDTO(List.of("사과", "바나나", "포도", "수박"));

        when(promptProvider.loadPrompt("prompts/quiz_creation_system.txt")).thenReturn("mock system instruction");
        when(promptProvider.loadPrompt("prompts/quiz_creation_user.txt")).thenReturn("mock user prompt template");
        when(promptProvider.buildPrompt(eq("mock user prompt template"), anyMap())).thenReturn("mock prompt");

        when(geminiClient.sendRequest(anyMap())).thenReturn("mockResponseBody");

        ObjectMapper realMapper = new ObjectMapper();
        ArrayNode mockParsedJson = realMapper.createArrayNode();
        ObjectNode item1 = realMapper.createObjectNode();
        item1.put("word", "사과");
        item1.put("questionText", "사과 뜻?");
        item1.put("correctAnswer", "1");
        item1.putArray("options").add("맛있는 과일").add("채소").add("고기").add("해산물");
        mockParsedJson.add(item1);

        try (var mockedParser = mockStatic(GeminiResponseParser.class)) {
            mockedParser.when(() -> GeminiResponseParser.extractStructuredOutput(eq("mockResponseBody"), any(ObjectMapper.class)))
                        .thenReturn(mockParsedJson);

            when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // when
            quizService.createQuiz(userId, reqDTO);

            // then
            verify(geminiClient, times(1)).sendRequest(anyMap());
            verify(quizRepository, times(1)).save(argThat(quiz -> {
                assertThat(quiz.getTitle()).contains("사과 외");
                assertThat(quiz.getQuizQuestions()).hasSize(1);
                assertThat(quiz.getQuizQuestions().getFirst().getWord()).isEqualTo("사과");
                return true;
            }));
        }
    }

    @Test
    @DisplayName("submitQuiz - DB에 등록된 퀴즈 문제가 없을 경우 QuizException 발생")
    void submitQuiz_fail_whenNoQuestions() {
        // given
        Long userId = 1L;
        Long quizId = 1L;

        User user = mock(User.class);
        ReflectionTestUtils.setField(user, "id", userId);

        Quiz quiz = Quiz.builder().title("빈 퀴즈").user(user).build();
        ReflectionTestUtils.setField(quiz, "id", quizId);
        ReflectionTestUtils.setField(quiz, "quizQuestions", List.of()); // 빈 리스트

        when(quizRepository.findByIdWithQuestions(quizId)).thenReturn(Optional.of(quiz));

        QuizHistoryReqDTO reqDTO = new QuizHistoryReqDTO(List.of());

        // when & then
        assertThatThrownBy(() -> quizService.submitQuiz(quizId, reqDTO))
                .isInstanceOf(QuizException.class)
                .hasMessage(QuizErrorCode.QUIZ_EMPTY_QUESTIONS.getMessage());
    }

    @Test
    @DisplayName("createQuiz - 요청 단어가 1개일 경우 'X 단어 퀴즈'로 제목 생성")
    void createQuiz_success_singleWord() {
        // given
        Long userId = 1L;
        User user = mock(User.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        QuizReqDTO reqDTO = new QuizReqDTO(List.of("사과"));

        when(promptProvider.loadPrompt("prompts/quiz_creation_system.txt")).thenReturn("mock system instruction");
        when(promptProvider.loadPrompt("prompts/quiz_creation_user.txt")).thenReturn("mock user prompt template");
        when(promptProvider.buildPrompt(eq("mock user prompt template"), anyMap())).thenReturn("mock prompt");

        when(geminiClient.sendRequest(anyMap())).thenReturn("mockResponseBody");

        ObjectMapper realMapper = new ObjectMapper();
        ArrayNode mockParsedJson = realMapper.createArrayNode();
        ObjectNode item1 = realMapper.createObjectNode();
        item1.put("word", "사과");
        item1.put("questionText", "사과 뜻?");
        item1.put("correctAnswer", "1");
        item1.putArray("options").add("맛있는 과일").add("채소").add("고기").add("해산물");
        mockParsedJson.add(item1);

        try (var mockedParser = mockStatic(GeminiResponseParser.class)) {
            mockedParser.when(() -> GeminiResponseParser.extractStructuredOutput(eq("mockResponseBody"), any(ObjectMapper.class)))
                        .thenReturn(mockParsedJson);

            when(quizRepository.save(any(Quiz.class))).thenAnswer(invocation -> invocation.getArgument(0));

            // when
            quizService.createQuiz(userId, reqDTO);

            // then
            verify(quizRepository, times(1)).save(argThat(quiz -> {
                assertThat(quiz.getTitle()).isEqualTo("사과 단어 퀴즈");
                return true;
            }));
        }
    }

    @Test
    @DisplayName("createQuiz - Gemini 응답이 비어있을 경우 IllegalStateException 발생")
    void createQuiz_fail_whenGeminiResponseEmpty() {
        // given
        Long userId = 1L;
        User user = mock(User.class);
        when(userRepository.findById(userId)).thenReturn(Optional.of(user));

        QuizReqDTO reqDTO = new QuizReqDTO(List.of("사과", "바나나"));

        when(promptProvider.loadPrompt("prompts/quiz_creation_system.txt")).thenReturn("mock system instruction");
        when(promptProvider.loadPrompt("prompts/quiz_creation_user.txt")).thenReturn("mock user prompt template");
        when(promptProvider.buildPrompt(eq("mock user prompt template"), anyMap())).thenReturn("mock prompt");

        when(geminiClient.sendRequest(anyMap())).thenReturn("mockResponseBody");

        ObjectMapper realMapper = new ObjectMapper();
        ArrayNode mockParsedJson = realMapper.createArrayNode(); // 빈 배열

        try (var mockedParser = mockStatic(GeminiResponseParser.class)) {
            mockedParser.when(() -> GeminiResponseParser.extractStructuredOutput(eq("mockResponseBody"), any(ObjectMapper.class)))
                        .thenReturn(mockParsedJson);

            // when & then
            assertThatThrownBy(() -> quizService.createQuiz(userId, reqDTO))
                    .isInstanceOf(QuizException.class)
                    .hasMessage("Gemini API로부터 퀴즈 문제를 생성하지 못했습니다.");
        }
    }
}
