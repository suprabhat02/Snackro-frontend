/**
 * Auth types — shared across all platforms
 * Re-exports from @snackro/types + auth-specific internal types
 */
export type {
  User,
  AuthSession,
  GoogleCredentialResponse,
  FetchTokenRequest,
  FetchTokenResponse,
  LoginRequest,
  LoginResponse,
  RefreshResponse,
  AuthMeResponse,
  UpdateProfileRequest,
  CreateUserRequest,
  LifestyleGoal,
} from "@snackro/types";

/** Auth state for Redux slice */
export interface AuthState {
  user: import("@snackro/types").User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
}

/** Initial state factory */
export const initialAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
};
