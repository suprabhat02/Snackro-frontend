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

  /** Initialize auth — restore session if token exists */
  const initialize = useCallback(() => {
    if (!isInitialized) {
      dispatch(restoreSession());
    }
  }, [dispatch, isInitialized]);

  /** Login with Google credential — returns a promise (unwrapped) */
  const login = useCallback(
    (idToken: string) => dispatch(googleLogin(idToken)).unwrap(),
    [dispatch],
  );

  /** Logout — clears session, token, and Redux state */
  const logout = useCallback(() => dispatch(logoutUser()), [dispatch]);

  /** Clear auth errors */
  const clearError = useCallback(() => dispatch(clearAuthError()), [dispatch]);

  /** Auto-initialize on mount */
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
