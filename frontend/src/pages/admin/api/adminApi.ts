import { axiosInstance } from "../../../app/apiClient";
import type { AdminDashboardRes, AdminUserListRes, PageResponse } from "../types/adminTypes";

export const getDashboardStats = async () => {
  const { data } = await axiosInstance.get<AdminDashboardRes>("/api/admin/stats");
  return data;
};

export const getUserList = async (params?: { name?: string; page?: number; size?: number; sort?: string }) => {
  const { data } = await axiosInstance.get<PageResponse<AdminUserListRes>>("/api/admin/users", { params });
  return data;
};

export const updateUserRole = async (userId: number, role: "ROLE_ADMIN" | "ROLE_USER") => {
  await axiosInstance.patch(`/api/admin/users/${userId}/role`, { role });
};

export const forceDeleteUser = async (userId: number) => {
  await axiosInstance.delete(`/api/admin/users/${userId}`);
};
