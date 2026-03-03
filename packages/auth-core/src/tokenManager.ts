/**
 * Token Manager — handles access token lifecycle
 *
 * SECURITY:
 * - Access tokens are stored in memory only (not persistent)
 * - Tokens automatically attached to requests via axios interceptor
 * - Cleared on logout or 401 responses
 * - Platform-agnostic (no DOM/localStorage usage)
 */

import { getAccessToken as getToken } from "@snackro/api/axios";

export { setAccessToken, getAccessToken, clearAccessToken } from "@snackro/api/axios";

/**
 * Check if we have an access token
 */
export function hasAccessToken(): boolean {
  return getToken() !== null;
}
