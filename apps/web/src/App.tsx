/**
 * App — Root component with routing, Google OAuth, Theme and Toast providers
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";
import { getConfig } from "@snackro/config/env";
import { ProtectedRoute, ProfileCompletionGuard } from "@snackro/features";
import { ThemeProvider } from "./contexts/ThemeContext";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CompleteProfilePage } from "./pages/CompleteProfilePage";

export function App() {
  const config = getConfig();

  return (
    <ThemeProvider>
      {/*
       * Toaster sits at ThemeProvider level so it inherits data-theme on <html>
       * and our CSS variables are available to the custom toast styles.
       */}
      <Toaster
        position="top-right"
        gutter={10}
        containerStyle={{ top: 16, right: 16 }}
        toastOptions={{
          duration: 4000,
          style: {
            fontFamily: "var(--font-sans, 'DM Sans', sans-serif)",
            fontSize: "0.875rem",
            fontWeight: 500,
            borderRadius: "var(--radius-md, 8px)",
            border: "1px solid var(--color-border-strong, #d8c4b2)",
            backgroundColor: "var(--color-bg-secondary, #fff8f0)",
            color: "var(--color-text-primary, #2b2420)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
            padding: "12px 16px",
            maxWidth: 380,
          },
          success: {
            iconTheme: { primary: "#16a34a", secondary: "#fff" },
          },
          error: {
            iconTheme: { primary: "#ef4444", secondary: "#fff" },
            duration: 5000,
          },
        }}
      />
      <GoogleOAuthProvider clientId={config.GOOGLE_CLIENT_ID}>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/login" element={<LoginPage />} />

            {/* Public — also accessible before login for new-user signup */}
            <Route path="/complete-profile" element={<CompleteProfilePage />} />

            {/* Authenticated + profile complete */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <ProfileCompletionGuard>
                    <DashboardPage />
                  </ProfileCompletionGuard>
                </ProtectedRoute>
              }
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </GoogleOAuthProvider>
    </ThemeProvider>
  );
}
