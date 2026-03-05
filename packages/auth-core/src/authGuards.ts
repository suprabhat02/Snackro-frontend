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

/**
 * Check if a user has completed their profile onboarding.
 * Profile is complete when weight, height and lifestyle are all set.
 * Used by ProfileCompletionGuard to enforce the onboarding wall.
 */
export function isProfileComplete(user: User): boolean {
  return (
    user.weight_kg !== null &&
    user.weight_kg !== undefined &&
    user.height_cm !== null &&
    user.height_cm !== undefined &&
    user.lifestyle !== null &&
    user.lifestyle !== undefined
  );
}
