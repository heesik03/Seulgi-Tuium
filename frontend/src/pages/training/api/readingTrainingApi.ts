import { axiosInstance } from "../../../app/apiClient";
import type { SentenceTrainingReq, SentenceGroupRes } from "../types/readingTraining";

export const readingTrainingApi = {
  /**
   * 문장 훈련 분할 처리 API
   * 입력된 텍스트를 선택한 난이도에 맞게 분할하여 반환합니다.
   */
  postSentenceChunk: async (req: SentenceTrainingReq): Promise<SentenceGroupRes[]> => {
    const response = await axiosInstance.post<SentenceGroupRes[]>("/api/training/chunk", req);
    return response.data;
  },
};
