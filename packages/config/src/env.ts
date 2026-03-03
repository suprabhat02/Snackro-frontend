/**
 * @snackro/config - Typed environment configuration
 *
 * This module provides validated, type-safe environment variables.
 * Build will fail at startup if required variables are missing.
 */

interface EnvConfig {
  /** Base URL for the API server */
  API_URL: string;
  /** Google OAuth 2.0 Client ID */
  GOOGLE_CLIENT_ID: string;
  /** Current mode */
  MODE: string;
  /** Whether running in production */
  IS_PRODUCTION: boolean;
  /** Whether running in development */
  IS_DEVELOPMENT: boolean;
}

function getEnvVar(key: string): string {
  // Vite exposes env vars via import.meta.env
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env ?? {};
  const value = env[key] as string | undefined;

  if (!value || value.trim() === "") {
    throw new Error(
      `[SNACKRO Config] Missing required environment variable: ${key}\n` +
        `Please check your .env.local file. See .env.example for reference.`,
    );
  }

  return value;
}

function createEnvConfig(): EnvConfig {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const env = (import.meta as any).env ?? {};
  const mode = (env.MODE as string) ?? "development";

  return {
    API_URL: getEnvVar("VITE_API_URL"),
    GOOGLE_CLIENT_ID: getEnvVar("VITE_GOOGLE_CLIENT_ID"),
    MODE: mode,
    IS_PRODUCTION: mode === "production",
    IS_DEVELOPMENT: mode === "development",
  };
}

/** Singleton environment configuration — validated on first access */
let _config: EnvConfig | null = null;

export function getConfig(): EnvConfig {
  if (!_config) {
    _config = createEnvConfig();
  }
  return _config;
}

/** Reset config (useful for testing) */
export function resetConfig(): void {
  _config = null;
}

export type { EnvConfig };
