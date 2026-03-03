/**
 * useAuth — React hook for auth operations
 *
 * Provides a clean API surface for components to interact with auth.
 * Encapsulates Redux dispatch, selectors, and auth logic.
 */
import { useCallback, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@snackro/store";
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
   * Initialize auth — restore session from cookies
   * Called once on app mount
   */
  const initialize = useCallback(() => {
    if (!isInitialized) {
      dispatch(restoreSession());
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
   * Logout — clears session, cookies, and Redux state
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
