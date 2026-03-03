/**
 * Auth Service — platform-agnostic auth operations
 *
 * Uses token-based authentication with /api/v1/auth/fetch/token endpoint
 * Access tokens are stored in memory, automatically added to all requests
 */
import { apiPost, apiGet } from "@snackro/api/axios";
import type { FetchTokenResponse, User } from "./authTypes";

const AUTH_ENDPOINTS = {
  FETCH_TOKEN: "/api/v1/auth/fetch/token",
  LOGOUT: "/api/v1/auth/logout",
  CHECK_USER: "/api/v1/auth/check-user",
  ME: "/api/v1/users/me",
} as const;

/**
 * Exchange Google ID token for JWT access token
 * This is the primary authentication method
 */
export async function loginWithGoogle(idToken: string): Promise<FetchTokenResponse> {
  return apiPost<FetchTokenResponse>(AUTH_ENDPOINTS.FETCH_TOKEN, { 
    id_token: idToken 
  });
}

/**
 * Logout — clears session on backend
 */
export async function logout(): Promise<void> {
  await apiPost(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Check authentication status
 */
export async function checkUser(): Promise<{ authenticated: boolean; user?: User }> {
  return apiGet(AUTH_ENDPOINTS.CHECK_USER);
}

/**
 * Get current user profile
 */
export async function getUserProfile(): Promise<User> {
  return apiGet<User>(AUTH_ENDPOINTS.ME);
}
