import { axiosInstance } from "../../../app/apiClient";
import { getErrorMessage } from "../../../utils/errorUtil";
import type {
  AnalysisTranslateReq,
  AnalysisTranslateRes,
  UrimalsaemReq,
  UrimalsaemRes,
} from "../types/analysisType";

export const translateText = async (data: AnalysisTranslateReq): Promise<AnalysisTranslateRes> => {
  try {
    const res = await axiosInstance.post<AnalysisTranslateRes>(
      "/api/analysis/translate",
      data,
    );
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};

export const searchUrimalsaem = async (params: UrimalsaemReq): Promise<UrimalsaemRes> => {
  try {
    const res = await axiosInstance.get<UrimalsaemRes>("/api/analysis/search", {
      params,
    });
    return res.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
