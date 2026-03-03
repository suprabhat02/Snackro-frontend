/**
 * Auth Guards — platform-agnostic permission checks
 */
import type { User } from "@snackro/types";

/**
 * Check if user is authenticated
 */
export function isAuthenticated(user: User | null): user is User {
  return user !== null && typeof user.id === "string" && user.id.length > 0;
}

/**
 * Check if a user has a valid email
 */
export function hasValidEmail(user: User): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email);
}

/**
 * Check if session is expired based on timestamp
 */
export function isSessionExpired(expiresAt: number): boolean {
  return Date.now() >= expiresAt;
}
