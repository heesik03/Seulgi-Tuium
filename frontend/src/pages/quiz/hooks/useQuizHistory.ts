import { useState, useCallback } from "react";
import {
  getQuizHistory,
  getQuizHistories,
  deleteQuizHistory,
} from "../api/quizApi";
import type { QuizHistoryResponse } from "../types/quizType";

export function useQuizHistory() {
  const [histories, setHistories] = useState<QuizHistoryResponse[]>([]);
  const [activeHistory, setActiveHistory] = useState<QuizHistoryResponse | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasNext, setHasNext] = useState(false);
  const [nextCursor, setNextCursor] = useState<number | null>(null);

  // 이력 목록 조회
  const fetchHistories = useCallback(async (cursorId?: number, size: number = 10) => {
    setIsPending(true);
    setError(null);
    try {
      const data = await getQuizHistories(cursorId, size);
      if (cursorId) {
        setHistories((prev) => [...prev, ...data.content]);
      } else {
        setHistories(data.content);
      }
      setHasNext(data.hasNext);
      setNextCursor(data.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : "이력 목록을 불러오지 못했습니다.");
    } finally {
      setIsPending(false);
    }
  }, []);

  // 이력 단건 상세 조회
  const fetchHistoryDetail = useCallback(async (historyId: number): Promise<QuizHistoryResponse | null> => {
    setIsPending(true);
    setError(null);
    try {
      const detail = await getQuizHistory(historyId);
      setActiveHistory(detail);
      return detail;
    } catch (err) {
      setError(err instanceof Error ? err.message : "이력 상세 조회를 실패했습니다.");
      return null;
    } finally {
      setIsPending(false);
    }
  }, []);

  // 이력 삭제
  const handleRemoveHistory = useCallback(async (historyId: number) => {
    setIsPending(true);
    setError(null);
    try {
      await deleteQuizHistory(historyId);
      setHistories((prev) => prev.filter((h) => h.historyId !== historyId));
      if (activeHistory?.historyId === historyId) {
        setActiveHistory(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "이력 삭제에 실패했습니다.");
      throw err;
    } finally {
      setIsPending(false);
    }
  }, [activeHistory]);

  return {
    histories,
    activeHistory,
    isPending,
    error,
    hasNext,
    nextCursor,
    fetchHistories,
    fetchHistoryDetail,
    handleRemoveHistory,
    setActiveHistory,
  };
}
