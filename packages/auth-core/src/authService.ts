/**
 * Auth Service — platform-agnostic auth operations
 *
 * Uses Axios transport layer for all auth API calls.
 * Token refresh is handled by HTTP-only cookies (no client-side storage).
 */
import { apiPost, apiGet } from "@snackro/api/axios";
import type { LoginResponse, AuthMeResponse } from "./authTypes";

const AUTH_ENDPOINTS = {
  LOGIN: "/auth/google",
  REFRESH: "/auth/refresh",
  LOGOUT: "/auth/logout",
  ME: "/auth/me",
} as const;

/**
 * Exchange Google ID token with backend for session
 */
export async function loginWithGoogle(idToken: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>(AUTH_ENDPOINTS.LOGIN, { idToken });
}

/**
 * Refresh the access token via HTTP-only cookie
 */
export async function refreshSession(): Promise<void> {
  await apiPost(AUTH_ENDPOINTS.REFRESH);
}

/**
 * Logout — clears session on backend + HTTP-only cookies
 */
export async function logout(): Promise<void> {
  await apiPost(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Restore session — called on app initialization
 */
export async function getMe(): Promise<AuthMeResponse> {
  return apiGet<AuthMeResponse>(AUTH_ENDPOINTS.ME);
}
