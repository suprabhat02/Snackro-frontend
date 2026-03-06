/**
 * Auth Service — platform-agnostic auth operations
 *
 * Uses token-based authentication with /api/v1/auth/fetch/token endpoint
 * Access tokens are stored in memory, automatically added to all requests
 */
import { apiPost, apiGet } from "@snackro/api/axios";
import type { FetchTokenResponse, User, CreateUserRequest } from "./authTypes";

const AUTH_ENDPOINTS = {
  FETCH_TOKEN: "/api/v1/auth/fetch/token",
  LOGOUT: "/api/v1/auth/logout",
  CHECK_USER: "/api/v1/auth/check-user",
  ME: "/api/v1/users/me",
  USERS: "/api/v1/users",
} as const;

// Matches FastAPI/google-auth clock-skew message:
// "Token used too early, 1234567890 < 1234567893. Check that your computer's clock is set correctly."
const CLOCK_SKEW_RE = /token used too early[^,]*,\s*(\d+)\s*<\s*(\d+)/i;
const MAX_CLOCK_SKEW_RETRIES = 3;

function getClockSkewWaitMs(error: unknown): number | null {
  const msg =
    error != null && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  const match = CLOCK_SKEW_RE.exec(msg);
  if (!match) return null;
  // skew in ms + 2 s safety buffer, capped at 12 s
  const skewMs = (parseInt(match[2], 10) - parseInt(match[1], 10)) * 1000;
  return Math.min(skewMs + 2000, 12_000);
}

/**
 * Exchange Google ID token for JWT access token.
 *
 * Automatically retries up to MAX_CLOCK_SKEW_RETRIES times when the backend
 * rejects the token due to clock skew ("Token used too early"). The wait
 * duration is derived from the timestamps in the error message so recovery
 * is as fast as possible without blind polling.
 */
export async function loginWithGoogle(
  idToken: string,
  _attempt = 0,
): Promise<FetchTokenResponse> {
  try {
    return await apiPost<FetchTokenResponse>(AUTH_ENDPOINTS.FETCH_TOKEN, {
      id_token: idToken,
    });
  } catch (error: unknown) {
    const waitMs =
      _attempt < MAX_CLOCK_SKEW_RETRIES ? getClockSkewWaitMs(error) : null;
    if (waitMs !== null) {
      await new Promise<void>((resolve) => setTimeout(resolve, waitMs));
      return loginWithGoogle(idToken, _attempt + 1);
    }
    throw error;
  }
}

/**
 * Logout — clears session on backend
 */
export async function logout(): Promise<void> {
  await apiPost(AUTH_ENDPOINTS.LOGOUT);
}

/**
 * Check authentication status — used for session restore on app mount.
 * Does NOT require email param; identity is derived from the Bearer token.
 */
export async function checkUser(): Promise<{
  authenticated: boolean;
  user?: User;
}> {
  return apiGet(AUTH_ENDPOINTS.CHECK_USER);
}

/**
 * Get current user profile by email.
 * Requires a valid access token in memory (set via setAccessToken).
 */
export async function getUserProfile(email: string): Promise<User> {
  return apiGet<User>(AUTH_ENDPOINTS.ME, { params: { email } });
}

/**
 * Create user profile after first login.
 * Called once during onboarding — backend calculates daily_protein_target.
 * Returns the full UserResponse including the calculated protein target.
 */
export async function createUserProfile(
  data: CreateUserRequest,
): Promise<User> {
  return apiPost<User>(AUTH_ENDPOINTS.USERS, data);
}
