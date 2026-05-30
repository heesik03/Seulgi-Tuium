import axios from "axios";

interface ErrorResponse {
  errorCode: string;
  message: string;
  timestamp: string;
}

export const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError<ErrorResponse>(error)) {
    return (
      error.response?.data?.message ||
      error.response?.statusText ||
      "서버 오류가 발생했습니다."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "알 수 없는 오류가 발생했습니다.";
};