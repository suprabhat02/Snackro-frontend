/**
 * @snackro/api - Enterprise Axios instance
 *
 * Features:
 * - JWT Bearer token authentication with Authorization header
 * - Request/response interceptors
 * - Automatic 401 handling
 * - Global error normalization
 * - API response unwrapping
 */
import axios, {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from "axios";
import { getConfig } from "@snackro/config/env";
import type { ApiError } from "@snackro/types";

// ─── Create Axios Instance ───────────────────────────────────
const apiClient = axios.create({
  baseURL: "", // Set lazily to avoid env access at module scope

  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  timeout: 30_000,
});

let baseURLSet = false;

function ensureBaseURL(config: InternalAxiosRequestConfig) {
  if (!baseURLSet) {
    const envConfig = getConfig();
    apiClient.defaults.baseURL = envConfig.API_URL;
    config.baseURL = envConfig.API_URL;
    baseURLSet = true;
  }
}

// ─── Token Storage ───────────────────────────────────────────
let accessToken: string | null = null;

export function setAccessToken(token: string) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

export function clearAccessToken() {
  accessToken = null;
}

// ─── Logout callback (set by auth-core) ──────────────────────
let onForceLogout: (() => void) | null = null;

export function setForceLogoutHandler(handler: () => void) {
  onForceLogout = handler;
}

// ─── Request Interceptor ─────────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    ensureBaseURL(config);
    // Add Authorization header if token exists
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    // Unwrap API response wrapper if present
    if (
      response.data &&
      typeof response.data === "object" &&
      "success" in response.data &&
      "data" in response.data
    ) {
      return { ...response, data: response.data.data };
    }
    return response;
  },
  async (error: AxiosError<ApiError>) => {
    // 401 on the token-exchange endpoint means the Google account has no
    // user record yet (unregistered) — NOT an expired session.
    // Only trigger forceLogout for 401s on OTHER authenticated endpoints.
    const url = error.config?.url ?? "";
    const isTokenExchange =
      url.includes("/auth/fetch/token") || url.includes("/auth/google");
    if (error.response?.status === 401 && !isTokenExchange) {
      clearAccessToken();
      if (onForceLogout) {
        onForceLogout();
      }
    }
    return Promise.reject(normalizeApiError(error));
  },
);

// ─── Error Normalizer ────────────────────────────────────────
function normalizeApiError(error: AxiosError<ApiError>): ApiError {
  if (error.response?.data) {
    return {
      status: error.response.status,
      message: error.response.data.message ?? "An error occurred",
      code: error.response.data.code ?? "API_ERROR",
      details: error.response.data.details,
    };
  }

  if (error.code === "ECONNABORTED") {
    return {
      status: 408,
      message: "Request timed out",
      code: "TIMEOUT",
    };
  }

  if (!error.response) {
    return {
      status: 0,
      message: "Network error — please check your connection",
      code: "NETWORK_ERROR",
    };
  }

  return {
    status: error.response?.status ?? 500,
    message: error.message ?? "An unexpected error occurred",
    code: "UNKNOWN_ERROR",
  };
}

// ─── Typed request helpers ───────────────────────────────────
export async function apiGet<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.get<T>(url, config);
  return response.data;
}

export async function apiPost<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.post<T>(url, data, config);
  return response.data;
}

export async function apiPut<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.put<T>(url, data, config);
  return response.data;
}

export async function apiDelete<T>(
  url: string,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.delete<T>(url, config);
  return response.data;
}

export async function apiPatch<T>(
  url: string,
  data?: unknown,
  config?: AxiosRequestConfig,
): Promise<T> {
  const response = await apiClient.patch<T>(url, data, config);
  return response.data;
}

export default apiClient;
