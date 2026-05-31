import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  userName: string | null;

  setAccessToken: (token: string | null) => void;
  logout: () => void;
}

const decodeJwtName = (token: string): string | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    const payload = JSON.parse(jsonPayload);
    return payload.name || null;
  } catch (error) {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  userName: null,

  setAccessToken: (token) =>
    set({
      accessToken: token,
      isAuthenticated: !!token,
      userName: token ? decodeJwtName(token) : null,
    }),

  logout: () =>
    set({
      accessToken: null,
      isAuthenticated: false,
      userName: null,
    }),
}));