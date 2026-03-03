/**
 * Token Manager — handles access token lifecycle
 *
 * SECURITY:
 * - Refresh tokens are NEVER stored on the client
 * - Refresh tokens live in HTTP-only cookies (managed by backend)
 * - This module only tracks in-memory access token state
 * - Designed to be platform-agnostic (no DOM/localStorage usage)
 */

let accessToken: string | null = null;

/**
 * Store the access token in memory (NOT persistent storage)
 */
export function setAccessToken(token: string): void {
  accessToken = token;
}

/**
 * Retrieve the current access token
 */
export function getAccessToken(): string | null {
  return accessToken;
}

/**
 * Clear the access token from memory
 */
export function clearAccessToken(): void {
  accessToken = null;
}

/**
 * Check if we have an access token
 */
export function hasAccessToken(): boolean {
  return accessToken !== null;
}
