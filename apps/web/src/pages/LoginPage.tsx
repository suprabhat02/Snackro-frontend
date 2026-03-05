/**
 * Login Page
 *
 * Two clear CTAs:
 *  • "Continue with Google"  — for existing Snackro users
 *  • "Create a new account"  — sends new users to the /complete-profile wizard
 *
 * Theme toggle (light / system / dark) is shown at the top-right corner.
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { AlertTriangle } from "react-feather";
import { useAuth } from "@snackro/features";
import { isProfileComplete } from "@snackro/auth-core";
import { Card, Stack, Typography, Container, Button } from "@snackro/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { SnackroLogo } from "../components/SnackroLogo";

export function LoginPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, error, login, clearError } =
    useAuth();

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isProfileComplete(user)) {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/complete-profile", { replace: true });
      }
    }
  }, [isAuthenticated, user, navigate]);

  const handleGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    clearError();
    try {
      await login(response.credential);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Login failed. Please try again.";
      window.alert(message);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "var(--color-bg-primary)",
        padding: "var(--space-4)",
      }}
    >
      {/* ── Top bar: theme toggle ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          marginBottom: "var(--space-4)",
        }}
      >
        <ThemeToggle />
      </div>

      {/* ── Centred card ── */}
      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Container maxWidth="440px">
          <Card padding="var(--space-8)">
            <Stack gap="var(--space-6)" align="center">
              {/* Logo + brand */}
              <Stack gap="var(--space-3)" align="center">
                <SnackroLogo size={52} />
                <Stack gap="var(--space-1)" align="center">
                  <Typography variant="h2" style={{ textAlign: "center" }}>
                    SNACKRO
                  </Typography>
                  <Typography
                    variant="caption"
                    color="var(--color-text-secondary)"
                    style={{ textAlign: "center" }}
                  >
                    Track your protein. Fuel your goals.
                  </Typography>
                </Stack>
              </Stack>

              {/* Divider */}
              <div
                style={{
                  width: "100%",
                  height: 1,
                  backgroundColor: "var(--color-border-strong)",
                }}
              />

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "var(--space-2)",
                    padding: "var(--space-3) var(--space-4)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-error-bg)",
                    border: "1px solid var(--color-error-border)",
                    color: "var(--color-error-text)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <AlertTriangle
                    size={15}
                    strokeWidth={2}
                    style={{ flexShrink: 0, marginTop: 1 }}
                  />
                  <span>{error}</span>
                </div>
              )}

              {/* Existing user: Continue with Google */}
              <Stack
                gap="var(--space-2)"
                align="center"
                style={{ width: "100%" }}
              >
                <Typography
                  variant="caption"
                  color="var(--color-text-secondary)"
                  style={{ textAlign: "center" }}
                >
                  Already have an account?
                </Typography>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    pointerEvents: isLoading ? "none" : "auto",
                    opacity: isLoading ? 0.6 : 1,
                  }}
                >
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() =>
                      window.alert("Google sign-in failed. Please try again.")
                    }
                    text="continue_with"
                    shape="rectangular"
                    theme="outline"
                    size="large"
                    width="320"
                  />
                </div>
              </Stack>

              {/* Visual separator */}
              <Stack
                direction="row"
                align="center"
                gap="var(--space-3)"
                style={{ width: "100%" }}
              >
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "var(--color-border-strong)",
                  }}
                />
                <Typography
                  variant="caption"
                  color="var(--color-text-secondary)"
                >
                  or
                </Typography>
                <div
                  style={{
                    flex: 1,
                    height: 1,
                    backgroundColor: "var(--color-border-strong)",
                  }}
                />
              </Stack>

              {/* New user: Create account */}
              <Stack
                gap="var(--space-2)"
                align="center"
                style={{ width: "100%" }}
              >
                <Typography
                  variant="caption"
                  color="var(--color-text-secondary)"
                  style={{ textAlign: "center" }}
                >
                  New to SNACKRO?
                </Typography>
                <Button
                  variant="primary"
                  style={{ width: "100%" }}
                  onClick={() => navigate("/complete-profile")}
                  disabled={isLoading}
                >
                  Create a new account
                </Button>
              </Stack>
            </Stack>
          </Card>
        </Container>
      </div>
    </div>
  );
}
