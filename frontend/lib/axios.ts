import axios from "axios";
import { clearTokens, getAccessToken, saveTokens } from "@/lib/auth";

const baseURL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
});

const PUBLIC_AUTH_PATHS = [
  "/api/auth/signup",
  "/api/auth/login",
  "/api/auth/refresh",
  "/api/auth/forgot-password",
  "/api/auth/verify-otp",
  "/api/auth/reset-password",
  // "/api/payments/verify",
];

function isPublicAuthRequest(url?: string) {
  if (!url) return false;
  // Strip origin, base URL, and query params for flexible matching
  const cleanedUrl = url.replace(baseURL, "");
  const pathname = cleanedUrl.split("?")[0].replace(/\/$/, ""); // remove trailing slash

  return PUBLIC_AUTH_PATHS.some((publicPath) => {
    const normalizedPublic = publicPath.replace(/\/$/, "");
    return (
      pathname === normalizedPublic || pathname.startsWith(normalizedPublic)
    );
  });
}

// Track refresh state to prevent multiple simultaneous refresh requests
let isRefreshing = false;
let authGeneration = 0;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Request Interceptor: Attach JWT token safely
api.interceptors.request.use((config) => {
  if (isPublicAuthRequest(config.url)) {
    delete config.headers.Authorization;
    return config;
  }

  // Get token safely
  let token: string | null = null;

  if (typeof window !== "undefined") {
    token = getAccessToken();
  } else if (config.headers.Authorization) {
    return config;
  }

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// Response Interceptor: Handle 401 & Auto-Refresh Token
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;

    // Skip public auth endpoints or unformed requests
    if (!originalRequest || isPublicAuthRequest(originalRequest.url)) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (typeof window === "undefined") {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      const refreshGeneration = authGeneration;

      const refreshToken = localStorage.getItem("refreshToken");

      if (!refreshToken) {
        // Safe clear that triggers "auth-changed" custom event for Context
        clearTokens();
        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(error);
      }

      try {
        const { data } = await axios.post(`${baseURL}/api/auth/refresh`, {
          refreshToken,
        });

        if (refreshGeneration !== authGeneration) {
          return Promise.reject(new Error("Authentication session ended during token refresh"));
        }

        const newAccessToken = data.accessToken;
        const newRefreshToken = data.refreshToken ?? refreshToken;

        // Uses central helper to dispatch "auth-changed" event and store accurately
        saveTokens({
          accessToken: newAccessToken,
          refreshToken: newRefreshToken,
          expiresIn: data.expiresIn,
        });

        api.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearTokens();

        if (
          typeof window !== "undefined" &&
          !window.location.pathname.includes("/login")
        ) {
          const currentPath = window.location.pathname + window.location.search;
          window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`;
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export function resetAuthClient() {
  authGeneration += 1;
  isRefreshing = false;
  delete api.defaults.headers.common.Authorization;
  processQueue(new Error("Authentication session ended"), null);
}

export default api;
