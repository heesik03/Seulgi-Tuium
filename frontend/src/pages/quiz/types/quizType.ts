export interface QuizCreateRequest {
  words: string[];
}

export interface QuizQuestionResponse {
  questionId: number;
  word: string;
  questionText: string;
  options: string; // "[\"선택지1\", \"선택지2\", ...]" 형식의 JSON 문자열
}

export interface QuizResponse {
  quizId: number;
  title: string;
  createdAt: string;
  questions: QuizQuestionResponse[];
}

export interface AnswerSubmit {
  questionId: number;
  submittedAnswer: string; // "1" ~ "4" 중 하나
}

export interface QuizSubmitRequest {
  answers: AnswerSubmit[];
}

export interface AnswerResultResponse {
  answerId: number;
  questionId: number;
  submittedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface QuizHistoryResponse {
  historyId: number;
  quizId: number;
  quizTitle?: string;
  score: number;
  solvedAt: string;
  results: AnswerResultResponse[];
}
