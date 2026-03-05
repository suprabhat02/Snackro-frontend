/**
 * App — Root component with routing, Google OAuth, and Theme providers
 */
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { GoogleOAuthProvider } from "@react-oauth/google";
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
