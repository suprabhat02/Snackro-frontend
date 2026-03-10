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
// Small safety margin on top of the measured skew (300 ms is enough — the
// server's clock advances between the failed call and the retry).
const CLOCK_SKEW_BUFFER_MS = 300;

// ── Clock-skew cache ──────────────────────────────────────────
// Stores the raw measured skew (no buffer baked in) so each login can
// compute the minimum remaining wait: max(0, rawSkew + BUFFER - elapsed).
const SKEW_KEY = "snackro.clock_skew_raw";
const SKEW_TTL_MS = 6 * 60 * 60 * 1000; // 6 h

function readCachedRawSkewMs(): number | null {
  try {
    const raw = localStorage.getItem(SKEW_KEY);
    if (!raw) return null;
    const { ms, ts } = JSON.parse(raw) as { ms: number; ts: number };
    if (Date.now() - ts > SKEW_TTL_MS) return null;
    return ms;
  } catch {
    return null;
  }
}

function writeCachedRawSkewMs(ms: number): void {
  try {
    localStorage.setItem(SKEW_KEY, JSON.stringify({ ms, ts: Date.now() }));
  } catch {
    // localStorage unavailable — silently skip caching
  }
}

/**
 * Decode the `iat` (issued-at) Unix timestamp from a JWT payload without any
 * library. Only used for timing math — all security verification is server-side.
 */
function decodeJwtIat(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const { iat } = JSON.parse(json) as Record<string, unknown>;
    return typeof iat === "number" ? iat : null;
  } catch {
    return null;
  }
}

/** Extract the raw server-clock skew (ms) from a "Token used too early" error. */
function parseRawSkewMs(error: unknown): number | null {
  const msg =
    error != null && typeof error === "object" && "message" in error
      ? String((error as { message: unknown }).message)
      : "";
  const match = CLOCK_SKEW_RE.exec(msg);
  if (!match) return null;
  return (parseInt(match[2], 10) - parseInt(match[1], 10)) * 1000;
}

const sleep = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Exchange Google ID token for JWT access token.
 *
 * Clock-skew strategy (minimises total wait time):
 *
 * • First-ever login (empty cache): fire immediately with no pre-delay.
 *   If the server rejects due to clock skew we parse the exact skew, cache
 *   it (raw, no buffer), then wait only the remaining milliseconds needed:
 *     wait = max(0, rawSkew + 300ms − elapsedSinceIat)
 *   With a popup that takes ~2 s and a 6 s skew, the wait is only ~4 s.
 *
 * • Subsequent logins (cache exists): pre-delay by the same formula so the
 *   very first outgoing request already succeeds — no failed call at all.
 *
 * In both cases the loading overlay hides the wait from the user.
 */
export async function loginWithGoogle(
  idToken: string,
  _attempt = 0,
): Promise<FetchTokenResponse> {
  const iat = decodeJwtIat(idToken);

  if (_attempt === 0) {
    const cached = readCachedRawSkewMs();
    if (cached !== null) {
      // We know the server skew: pre-delay by exactly what's still needed.
      const elapsed = iat !== null ? Date.now() - iat * 1000 : 0;
      const preDelay = Math.max(0, cached + CLOCK_SKEW_BUFFER_MS - elapsed);
      if (preDelay > 0) await sleep(preDelay);
    }
    // No cache: fire immediately and handle failure below if it occurs.
  }

  try {
    return await apiPost<FetchTokenResponse>(AUTH_ENDPOINTS.FETCH_TOKEN, {
      id_token: idToken,
    });
  } catch (error: unknown) {
    const rawSkew =
      _attempt < MAX_CLOCK_SKEW_RETRIES ? parseRawSkewMs(error) : null;
    if (rawSkew !== null) {
      writeCachedRawSkewMs(rawSkew);
      // Wait only the slice of time still needed — often < 500 ms after the
      // popup + failed-request round trip has already consumed most of the skew.
      const elapsed = iat !== null ? Date.now() - iat * 1000 : 0;
      const waitMs = Math.max(0, rawSkew + CLOCK_SKEW_BUFFER_MS - elapsed);
      if (waitMs > 0) await sleep(waitMs);
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
