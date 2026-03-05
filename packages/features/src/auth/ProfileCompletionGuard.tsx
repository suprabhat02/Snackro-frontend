/**
 * ProfileCompletionGuard — guards routes that require a completed user profile.
 *
 * Layered ON TOP of ProtectedRoute (auth must already be confirmed).
 * Enforces the onboarding wall: users without weight/height/lifestyle
 * are redirected to /complete-profile before they can access the dashboard.
 *
 * Redirect precedence:
 *   not authenticated → /login      (handled by ProtectedRoute)
 *   authenticated, no profile → /complete-profile
 *   authenticated, profile ok → renders children
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isProfileComplete } from "@snackro/auth-core";
import { useAuth } from "./useAuth";

interface ProfileCompletionGuardProps {
  children: React.ReactNode;
  /** Where to send users without completed profile (default: /complete-profile) */
  redirectTo?: string;
}

export const ProfileCompletionGuard: React.FC<ProfileCompletionGuardProps> = ({
  children,
  redirectTo = "/complete-profile",
}) => {
  const { isAuthenticated, isInitialized, isLoading, user } = useAuth();
  const location = useLocation();

  // Still initializing — wait for ProtectedRoute above to render the spinner
  if (!isInitialized || isLoading) return null;

  // Not authenticated — ProtectedRoute should have already redirected, but be safe
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Profile incomplete — redirect to onboarding
  if (!isProfileComplete(user)) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
