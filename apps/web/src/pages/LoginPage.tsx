/**
 * Login Page — Google OAuth login screen
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLoginButton, useAuth } from "@snackro/features";
import { Card, Stack, Typography, Container } from "@snackro/ui";

export function LoginPage() {
  const navigate = useNavigate();
  const { isAuthenticated, isInitialized, error, clearError } = useAuth();

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated && isInitialized) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, isInitialized, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "var(--color-bg-primary)",
        padding: "var(--space-4)",
      }}
    >
      <Container maxWidth="420px">
        <Card
          padding="var(--space-7)"
          style={{ animation: "fadeIn 0.4s ease-out" }}
        >
          <Stack gap="var(--space-5)" align="center">
            {/* Logo */}
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-orange-500)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-soft)",
              }}
            >
              <span
                style={{
                  color: "#fff",
                  fontSize: "var(--font-size-3xl)",
                  fontWeight: 700,
                }}
              >
                S
              </span>
            </div>

            <Stack gap="var(--space-2)" align="center">
              <Typography variant="h2" align="center">
                SNACKRO
              </Typography>
              <Typography
                variant="body"
                color="var(--color-text-muted)"
                align="center"
              >
                Sign in to continue to your dashboard
              </Typography>
            </Stack>

            {/* Error Display */}
            {error && (
              <div
                style={{
                  width: "100%",
                  padding: "var(--space-3)",
                  backgroundColor: "#fef2f2",
                  border: "1px solid #fecaca",
                  borderRadius: "var(--radius-sm)",
                  color: "var(--color-danger)",
                  fontSize: "var(--font-size-sm)",
                  textAlign: "center",
                  cursor: "pointer",
                }}
                onClick={clearError}
                role="alert"
              >
                {error}
                <div
                  style={{
                    fontSize: "var(--font-size-xs)",
                    marginTop: "var(--space-1)",
                    opacity: 0.7,
                  }}
                >
                  Click to dismiss
                </div>
              </div>
            )}

            {/* Google Login Button */}
            <GoogleLoginButton
              onSuccess={() => navigate("/dashboard")}
              onError={(err) => console.error("Login error:", err)}
            />

            <Typography
              variant="caption"
              align="center"
              color="var(--color-text-muted)"
            >
              By continuing, you agree to our Terms of Service
            </Typography>
          </Stack>
        </Card>
      </Container>
    </div>
  );
}
