/**
 * ProtectedRoute — guards routes that require authentication
 *
 * - Shows loader while session is initializing
 * - Redirects to /login if not authenticated
 * - Renders children if authenticated
 */
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
  /** Where to redirect unauthenticated users (default: /login) */
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = "/login",
}) => {
  const { isAuthenticated, isInitialized, isLoading } = useAuth();
  const location = useLocation();

  // Still checking session
  if (!isInitialized || isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          fontFamily: "system-ui, sans-serif",
          color: "var(--color-text-secondary, #5c4f46)",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: 40,
              height: 40,
              border: "3px solid var(--color-border-soft, #eadfd4)",
              borderTopColor: "var(--color-orange-500, #f07e1c)",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
