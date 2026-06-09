import { create } from "zustand";

const REFRESH_SESSION_KEY = "hasRefreshSession";

interface AuthState {
  accessToken: string | null;
  isAuthenticated: boolean;
  isAuthInitialized: boolean;
  userName: string | null;
  role: string | null;
  isAdmin: boolean;

  setAccessToken: (token: string | null) => void;
  setAuthInitialized: (initialized: boolean) => void;
  logout: () => void;
}

export const hasRefreshSession = () =>
  typeof window !== "undefined" &&
  window.localStorage.getItem(REFRESH_SESSION_KEY) === "true";

const setRefreshSession = (hasSession: boolean) => {
  if (typeof window === "undefined") {
    return;
  }

  if (hasSession) {
    window.localStorage.setItem(REFRESH_SESSION_KEY, "true");
    return;
  }

  window.localStorage.removeItem(REFRESH_SESSION_KEY);
};

interface JwtPayload {
  name?: string;
  role?: string;
  [key: string]: any;
}

const decodeJwtPayload = (token: string): JwtPayload | null => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  accessToken: null,
  isAuthenticated: false,
  isAuthInitialized: false,
  userName: null,
  role: null,
  isAdmin: false,

  setAccessToken: (token) => {
    setRefreshSession(!!token);
    const payload = token ? decodeJwtPayload(token) : null;
    const role = payload?.role || null;
    set({
      accessToken: token,
      isAuthenticated: !!token,
      userName: payload?.name || null,
      role: role,
      isAdmin: role === "ROLE_ADMIN",
    });
  },

  setAuthInitialized: (initialized) =>
    set({
      isAuthInitialized: initialized,
    }),

  logout: () => {
    setRefreshSession(false);
    set({
      accessToken: null,
      isAuthenticated: false,
      userName: null,
      role: null,
      isAdmin: false,
    });
  },
}));
