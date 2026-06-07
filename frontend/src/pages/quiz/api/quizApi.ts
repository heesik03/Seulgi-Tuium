import { axiosInstance } from "../../../app/apiClient";
import { getErrorMessage } from "../../../utils/errorUtil";
import type { CursorResponse } from "../../../types/common";
import type {
  QuizCreateRequest,
  QuizResponse,
  QuizSubmitRequest,
  QuizHistoryResponse,
} from "../types/quizType";

// 퀴즈 생성
export const createQuiz = async (data: QuizCreateRequest): Promise<QuizResponse> => {
  try {
    const res = await axiosInstance.post<QuizResponse>("/api/quizzes", data);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 단건 상세 조회
export const getQuiz = async (quizId: number): Promise<QuizResponse> => {
  try {
    const res = await axiosInstance.get<QuizResponse>(`/api/quizzes/${quizId}`);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 내 퀴즈 목록 페이징 조회
export const getQuizzes = async (
  cursorId?: number,
  size: number = 10
): Promise<CursorResponse<QuizResponse>> => {
  try {
    const res = await axiosInstance.get<CursorResponse<QuizResponse>>("/api/quizzes", {
      params: { cursorId, size },
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 삭제
export const deleteQuiz = async (quizId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/quizzes/${quizId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 제목 수정
export const updateQuizTitle = async (
  quizId: number,
  title: string
): Promise<QuizResponse> => {
  try {
    const res = await axiosInstance.patch<QuizResponse>(`/api/quizzes/${quizId}`, {
      title,
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 답안 제출 및 채점
export const submitQuiz = async (
  quizId: number,
  data: QuizSubmitRequest
): Promise<QuizHistoryResponse> => {
  try {
    const res = await axiosInstance.post<QuizHistoryResponse>(
      `/api/quizzes/${quizId}/submit`,
      data
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 이력 단건 상세 조회
export const getQuizHistory = async (historyId: number): Promise<QuizHistoryResponse> => {
  try {
    const res = await axiosInstance.get<QuizHistoryResponse>(
      `/api/quiz-histories/${historyId}`
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 전체 퀴즈 풀이 이력 페이징 조회
export const getQuizHistories = async (
  cursorId?: number,
  size: number = 10
): Promise<CursorResponse<QuizHistoryResponse>> => {
  try {
    const res = await axiosInstance.get<CursorResponse<QuizHistoryResponse>>(
      "/api/quiz-histories",
      {
        params: { cursorId, size },
      }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

// 퀴즈 풀이 이력 삭제
export const deleteQuizHistory = async (historyId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/quiz-histories/${historyId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
