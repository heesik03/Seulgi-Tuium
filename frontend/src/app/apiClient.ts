import axios from "axios";
import { useAuthStore } from "../store/authStore";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

const refreshClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

let isRefreshing = false;
let refreshPromise: Promise<string> | null = null;

axiosInstance.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status !== 401 ||
      originalRequest._retry
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    // 리프레쉬 토큰 존재 여부 확인 (쿠키 또는 로컬스토리지)
    const hasRefreshToken = document.cookie.includes("refreshToken") || localStorage.getItem("refreshToken");

    if (!hasRefreshToken) {
      useAuthStore.getState().logout();
      window.location.replace("/login");
      return Promise.reject(error);
    }

    try {
      if (!isRefreshing) {
        isRefreshing = true;

        refreshPromise = refreshClient
          .post("/api/auth/refresh")
          .then((res) => {
            const accessToken = res.data.accessToken;

            useAuthStore
              .getState()
              .setAccessToken(accessToken);

            return accessToken;
          })
          .finally(() => {
            isRefreshing = false;
            refreshPromise = null;
          });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers.Authorization =
        `Bearer ${newAccessToken}`;

      return axiosInstance(originalRequest);
    } catch (err) {
      useAuthStore.getState().logout();

      window.location.replace("/login");

      return Promise.reject(err);
    }
  }
);