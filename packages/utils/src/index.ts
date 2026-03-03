/**
 * @snackro/utils - Platform-agnostic utility functions
 * No DOM dependencies — safe for web and mobile
 */

/**
 * Type-safe delay function
 */
export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    return JSON.parse(json) as T;
  } catch {
    return fallback;
  }
}

/**
 * Check if a value is non-null/undefined
 */
export function isDefined<T>(value: T | null | undefined): value is T {
  return value !== null && value !== undefined;
}

/**
 * Normalize API error to a consistent shape
 */
export function normalizeError(error: unknown): {
  message: string;
  code: string;
} {
  if (error instanceof Error) {
    return { message: error.message, code: "UNKNOWN_ERROR" };
  }
  if (typeof error === "object" && error !== null) {
    const err = error as Record<string, unknown>;
    return {
      message: (err.message as string) ?? "An unknown error occurred",
      code: (err.code as string) ?? "UNKNOWN_ERROR",
    };
  }
  return { message: "An unknown error occurred", code: "UNKNOWN_ERROR" };
}

/**
 * Create a unique ID (platform-agnostic)
 */
export function createId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Clamp a number within a range
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Debounce function (platform-agnostic)
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  ms: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), ms);
  };
}
