export {
  loginWithGoogle,
  logout,
  getUserProfile,
  checkUser,
  createUserProfile,
} from "./authService";
export {
  setAccessToken,
  getAccessToken,
  clearAccessToken,
  hasAccessToken,
} from "./tokenManager";
export {
  isAuthenticated,
  hasValidEmail,
  isSessionExpired,
  isProfileComplete,
} from "./authGuards";
export { initialAuthState } from "./authTypes";
export type { AuthState } from "./authTypes";
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
} from "./authTypes";
