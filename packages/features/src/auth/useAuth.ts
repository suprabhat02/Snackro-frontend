/**
 * useAuth — React hook for auth operations
 *
 * Provides a clean API surface for components to interact with auth.
 * Encapsulates Redux dispatch, selectors, and auth logic.
 */
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@snackro/store";
import { hasAccessToken } from "@snackro/auth-core/tokenManager";
import {
  googleLogin,
  logoutUser,
  restoreSession,
  clearAuthError,
} from "./authSlice";

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, isInitialized, error } =
    useAppSelector((state) => state.auth);

  /**
   * Initialize auth — restore session if token exists
   * Called once on app mount
   */
  const initialize = useCallback(() => {
    if (!isInitialized) {
      // Only try to restore if we have a token
      if (hasAccessToken()) {
        dispatch(restoreSession());
      } else {
        // Mark as initialized without a session
        // The slice will handle this gracefully
        dispatch(restoreSession());
      }
    }
  }, [dispatch, isInitialized]);

  /**
   * Login with Google credential
   */
  const login = useCallback(
    (idToken: string) => {
      return dispatch(googleLogin(idToken)).unwrap();
    },
    [dispatch],
  );

  /**
   * Logout — clears session, token, and Redux state
   */
  const logout = useCallback(() => {
    return dispatch(logoutUser());
  }, [dispatch]);

  /**
   * Clear auth errors
   */
  const clearError = useCallback(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  /**
   * Auto-initialize on mount
   */
  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    error,
    login,
    logout,
    clearError,
  };
}
