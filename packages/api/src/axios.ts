/**
 * @snackro/api - Enterprise Axios instance
 *
 * Features:
 * - Automatic credential handling (HTTP-only cookies)
 * - Request/response interceptors
 * - Automatic 401 → refresh → retry flow
 * - Refresh lock to prevent concurrent refresh races
 * - Global error normalization
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
  withCredentials: true, // Always send HTTP-only cookies
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

// ─── Refresh Lock ─────────────────────────────────────────────
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

function processQueue(error: AxiosError | null) {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve();
    }
  });
  failedQueue = [];
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
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ────────────────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // If not a 401, or already retried, or refresh endpoint itself — reject
    if (
      error.response?.status !== 401 ||
      originalRequest._retry ||
      originalRequest.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(normalizeApiError(error));
    }

    // Lock: If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      }).then(() => apiClient(originalRequest));
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      await apiClient.post("/auth/refresh");
      processQueue(null);
      return apiClient(originalRequest);
    } catch (refreshError) {
      processQueue(refreshError as AxiosError);
      // Force logout — refresh token is expired
      if (onForceLogout) {
        onForceLogout();
      }
      return Promise.reject(refreshError);
    } finally {
      isRefreshing = false;
    }
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

export { apiClient };
export default apiClient;
