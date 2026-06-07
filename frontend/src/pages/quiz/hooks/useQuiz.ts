import { useState, useCallback } from "react";
import {
  createQuiz,
  getQuiz,
  getQuizzes,
  deleteQuiz,
  updateQuizTitle,
  submitQuiz,
} from "../api/quizApi";
import type { QuizResponse, QuizHistoryResponse, AnswerSubmit } from "../types/quizType";

export function useQuiz() {
  const [quizzes, setQuizzes] = useState<QuizResponse[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<QuizResponse | null>(null);
  const [answers, setAnswers] = useState<Record<number, string>>({}); // { questionId: submittedAnswer }
  const [quizResult, setQuizResult] = useState<QuizHistoryResponse | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  // 퀴즈 생성
  const handleCreateQuiz = useCallback(async (words: string[]): Promise<QuizResponse | null> => {
    setIsPending(true);
    setError(null);
    try {
      const newQuiz = await createQuiz({ words });
      setActiveQuiz(newQuiz);
      setAnswers({});
      setQuizResult(null);
      return newQuiz;
    } catch (err) {
      const msg = err instanceof Error ? err.message : "퀴즈 생성 중 오류가 발생했습니다.";
      setError(msg);
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  // 퀴즈 목록 조회 (페이징)
  const fetchQuizzes = useCallback(async (cursorId?: number, size: number = 10) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await getQuizzes(cursorId, size);
      if (cursorId) {
        setQuizzes((prev) => [...prev, ...data.content]);
      } else {
        setQuizzes(data.content);
      }
      setHasNext(data.hasNext);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "퀴즈 목록을 불러오지 못했습니다.");
    } finally {
      setIsPending(false);
    }
  }, []);

  // 단건 상세 조회
  const fetchQuizDetail = useCallback(async (quizId: number): Promise<QuizResponse | null> => {
    setIsPending(true);
    setError(null);
    try {
      const detail = await getQuiz(quizId);
      setActiveQuiz(detail);
      setAnswers({});
      setQuizResult(null);
      return detail;
    } catch (err) {
      setError(err instanceof Error ? err.message : "퀴즈를 불러오지 못했습니다.");
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  // 퀴즈 삭제
  const handleExtractQuiz = useCallback(async (quizId: number) => {
    setIsPending(true);
    setError(null);
    try {
      await deleteQuiz(quizId);
      setQuizzes((prev) => prev.filter((q) => q.quizId !== quizId));
      if (activeQuiz?.quizId === quizId) {
        setActiveQuiz(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "퀴즈 삭제에 실패했습니다.");
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [activeQuiz]);

  // 퀴즈 제목 수정
  const handleModifyQuizTitle = useCallback(async (quizId: number, title: string) => {
    setIsPending(true);
    setError(null);
    try {
      const updated = await updateQuizTitle(quizId, title);
      setQuizzes((prev) => prev.map((q) => (q.quizId === quizId ? updated : q)));
      if (activeQuiz?.quizId === quizId) {
        setActiveQuiz(updated);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "제목 수정에 실패했습니다.");
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [activeQuiz]);

  // 답안 임시 기입
  const handleMarkAnswer = useCallback((questionId: number, submittedAnswer: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: submittedAnswer,
    }));
  }, []);

  // 퀴즈 제출 및 채점
  const handleSubmitQuiz = useCallback(async (quizId: number): Promise<QuizHistoryResponse | null> => {
    if (!activeQuiz) return null;
    setIsPending(true);
    setError(null);

    const submitAnswers: AnswerSubmit[] = activeQuiz.questions.map((q) => ({
      questionId: q.questionId,
      submittedAnswer: answers[q.questionId] || "",
    }));

    // 모든 질문에 답이 입력되었는지 검증 (백엔드 최소/최대 4개 필수 사항 준수)
    if (submitAnswers.some((ans) => !ans.submittedAnswer)) {
      setError("모든 문제의 답을 선택해야 합니다.");
      setIsPending(false);
      return null;
    }

    try {
      const result = await submitQuiz(quizId, { answers: submitAnswers });
      setQuizResult(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : "답안 제출 중 오류가 발생했습니다.");
      return null;
    } finally {
      setIsPending(false);
    }
  }, [activeQuiz, answers]);

  // 풀이 상태 리셋 (다시 풀기 등)
  const resetQuizPlay = useCallback(() => {
    setAnswers({});
    setQuizResult(null);
  }, []);

  return {
    quizzes,
    activeQuiz,
    answers,
    quizResult,
    isPending,
    error,
    hasNext,
    nextCursor,
    handleCreateQuiz,
    fetchQuizzes,
    fetchQuizDetail,
    handleExtractQuiz,
    handleModifyQuizTitle,
    handleMarkAnswer,
    handleSubmitQuiz,
    resetQuizPlay,
    setActiveQuiz,
    setQuizResult,
  };
}
