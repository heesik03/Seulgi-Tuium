import { axiosInstance } from "../../../app/apiClient";
import { getErrorMessage } from "../../../utils/errorUtil";
import type { CursorResponse } from "./wordType";
import type {
  WordBookRes,
  WordBookWordRes,
  CreateWordBookReq,
  CreateWordBookWithWordsReq,
  UpdateWordBookReq,
} from "./wordBookType";

export const getWordBooks = async (): Promise<WordBookRes[]> => {
  try {
    const res = await axiosInstance.get<WordBookRes[]>("/api/wordbook");
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const getWordBookWords = async (
  wordBookId: number,
  lastId?: number,
  size: number = 10
): Promise<CursorResponse<WordBookWordRes>> => {
  try {
    const res = await axiosInstance.get<CursorResponse<WordBookWordRes>>(
      `/api/wordbook/${wordBookId}/words`,
      { params: { lastId, size } }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createEmptyWordBook = async (
  data: CreateWordBookReq
): Promise<number> => {
  try {
    const res = await axiosInstance.post<number>("/api/wordbook/empty", data);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const createWordBookWithWords = async (
  data: CreateWordBookWithWordsReq
): Promise<number> => {
  try {
    const res = await axiosInstance.post<number>(
      "/api/wordbook/with-words",
      data
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const updateWordBook = async (
  wordBookId: number,
  data: UpdateWordBookReq
): Promise<void> => {
  try {
    await axiosInstance.patch(`/api/wordbook/${wordBookId}`, data);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteWordBook = async (wordBookId: number): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/wordbook/${wordBookId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
