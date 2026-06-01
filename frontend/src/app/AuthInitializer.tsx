import { useEffect } from "react";
import { hasRefreshSession, useAuthStore } from "../store/authStore";
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

export const AuthInitializer = () => {
  const setAccessToken = useAuthStore((state) => state.setAccessToken);
  const setAuthInitialized = useAuthStore((state) => state.setAuthInitialized);

  useEffect(() => {
    const initialize = async () => {
      setAuthInitialized(false);

      // 1. Check for OAuth callback token
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("accessToken");

      if (urlToken) {
        setAccessToken(urlToken);
        setAuthInitialized(true);
        // Clear the URL parameter without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      if (!hasRefreshSession()) {
        setAccessToken(null);
        setAuthInitialized(true);
        return;
      }

      // 2. Attempt refresh token only for browsers that have logged in before.
      try {
        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        setAccessToken(res.data.accessToken);
      } catch {
        setAccessToken(null);
      } finally {
        setAuthInitialized(true);
      }
    };

    initialize();
  }, [setAccessToken, setAuthInitialized]);

  return null;
};
