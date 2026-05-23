/**
 * Central Axios instance for the B2B Wholesale API.
 *
 * - Attaches the Bearer access token to every request.
 * - On a 401, transparently refreshes the token pair once via POST /auth/refresh
 *   and replays the original request. Concurrent 401s share a single refresh
 *   (request queue) so we never fire N refreshes at once.
 * - On refresh failure it clears the session and notifies the app (forced logout).
 */
import axios, {
  AxiosError,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthResponse, ErrorResponse } from "@/types/api";
import {
  clearSession,
  getAccessToken,
  getRefreshToken,
  updateTokens,
} from "./storage";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8082/api/v1";

export const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

// --- Forced-logout hook: AuthContext registers a handler so it can react to
// an unrecoverable auth failure (e.g. expired refresh token). ---
type LogoutHandler = () => void;
let onForcedLogout: LogoutHandler | null = null;
export function setForcedLogoutHandler(handler: LogoutHandler | null): void {
  onForcedLogout = handler;
}

// --- Request: attach access token. ---
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- Response: single-flight token refresh on 401. ---
let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  // Use a bare axios call (no interceptors) to avoid recursion.
  const { data } = await axios.post<AuthResponse>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
    { headers: { "Content-Type": "application/json" } },
  );
  updateTokens(data.accessToken, data.refreshToken);
  return data.accessToken;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ErrorResponse>) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined;

    const isAuthCall = original?.url?.includes("/auth/");
    const canRetry =
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthCall &&
      getRefreshToken();

    if (canRetry) {
      original._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        refreshPromise = null;
        clearSession();
        onForcedLogout?.();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  },
);

/** Normalises any thrown error into a human-readable message for toasts/forms. */
export function getApiErrorMessage(error: unknown, fallback = "Something went wrong"): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ErrorResponse | undefined;
    if (data?.fieldErrors && Object.keys(data.fieldErrors).length > 0) {
      return Object.values(data.fieldErrors)[0];
    }
    return data?.message ?? error.message ?? fallback;
  }
  if (error instanceof Error) return error.message;
  return fallback;
}
