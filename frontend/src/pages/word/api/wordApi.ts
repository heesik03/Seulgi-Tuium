import { axiosInstance } from "../../../app/apiClient";
import { getErrorMessage } from "../../../utils/errorUtil";
import type { FavoriteWordRes, AddWordReq, CursorResponse } from "../types/wordType";

export const getFavoriteWords = async (lastId?: number,size: number = 10): Promise<CursorResponse<FavoriteWordRes>> => {
  try {
    const res = await axiosInstance.get<CursorResponse<FavoriteWordRes>>(
      "/api/word",
      { params: { lastId, size } }
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const addFavoriteWord = async (data: AddWordReq): Promise<number> => {
  try {
    const res = await axiosInstance.post<number>("/api/word", data);
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const deleteFavoriteWord = async (favoriteWordId: number,): Promise<void> => {
  try {
    await axiosInstance.delete(`/api/word/${favoriteWordId}`);
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
