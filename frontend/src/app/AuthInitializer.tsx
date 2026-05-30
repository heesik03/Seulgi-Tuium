import { useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import axios from "axios";

export const AuthInitializer = () => {
  const setAccessToken = useAuthStore(
    (state) => state.setAccessToken
  );

  useEffect(() => {
    const initialize = async () => {
      // 1. Check for OAuth callback token
      const params = new URLSearchParams(window.location.search);
      const urlToken = params.get("accessToken");

      if (urlToken) {
        setAccessToken(urlToken);
        // Clear the URL parameter without reloading
        window.history.replaceState({}, document.title, window.location.pathname);
        return;
      }

      // 2. Attempt refresh token
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/refresh`,
          {},
          {
            withCredentials: true,
          }
        );

        setAccessToken(res.data.accessToken);
      } catch {
        setAccessToken(null);
      }
    };

    initialize();
  }, [setAccessToken]);

  return null;
};