import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;

  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,

  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
    }),

  logout: () =>
    set({
      accessToken: null,
      isAuthenticated: false,
    }),
}));