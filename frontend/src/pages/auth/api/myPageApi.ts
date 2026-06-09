import { axiosInstance } from "../../../app/apiClient";
import type { MyPageRes } from "../types/myPageTypes";

export const getMyPageStats = async () => {
  const { data } = await axiosInstance.get<MyPageRes>("/api/user/me");
  return data;
};

export const updateUserName = async (name: string) => {
  const { data } = await axiosInstance.patch<{ accessToken: string; tokenType: string }>(`/api/user/name/${encodeURIComponent(name)}`);
  return data;
};

export const updatePassword = async (password: string) => {
  await axiosInstance.patch("/api/user/password", { password });
};

export const deleteAccount = async () => {
  await axiosInstance.delete("/api/user");
};
