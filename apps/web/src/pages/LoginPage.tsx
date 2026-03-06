/**
 * Login Page — Two-column layout
 *
 * Left  : RunningWoman illustration on an orange gradient panel (hidden on mobile)
 * Right : Sign-in / create-account card
 *
 * Animations (framer-motion):
 *   • Left panel slides in from the left
 *   • Card fades + rises on mount
 *   • Logo bounces in with spring
 *   • Buttons stagger in from below
 *
 * Toasts (react-hot-toast):
 *   • Error toast on failed Google login
 *   • Replaces all window.alert() calls
 */
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google";
import { motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";
import toast from "react-hot-toast";
import { AlertTriangle } from "react-feather";
import { useAuth } from "@snackro/features";
import { isProfileComplete } from "@snackro/auth-core";
import { Card, Stack, Typography, Container, Button } from "@snackro/ui";
import { ThemeToggle } from "../components/ThemeToggle";

import { RunningWoman } from "../components/RunningWoman";
import { SnackroSVGLogo } from "../components/SnackroSVGLogo";

// ─── Animation variants ───────────────────────────────────────

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 340, damping: 28 },
  },
};

const logoVariant: Variants = {
  hidden: { scale: 0.6, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 420, damping: 20 },
  },
};

const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.18 } },
};

const childFadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 300, damping: 26 },
  },
};

const leftPanelVariant: Variants = {
  hidden: { opacity: 0, x: -60 },
  show: {
    opacity: 1,
    x: 0,
    transition: { type: "spring", stiffness: 220, damping: 28, delay: 0.05 },
  },
};

const illustrationVariant: Variants = {
  hidden: { scale: 0.88, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: "spring", stiffness: 200, damping: 24, delay: 0.25 },
  },
};

// ─── Component ────────────────────────────────────────────────

export function LoginPage() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const { user, isAuthenticated, isLoading, error, login, clearError } =
    useAuth();

  // Show Redux-level auth error as toast
  useEffect(() => {
    if (error) {
      toast.error(error, { id: "auth-error" });
      clearError();
    }
  }, [error, clearError]);

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
      toast.error(message);
    }
  };

  return (
    <>
      {/* Responsive: hide left panel on narrow screens */}
      <style>{`
        @media (max-width: 768px) {
          .snackro-login-left { display: none !important; }
        }
      `}</style>

      <motion.div
        initial={shouldReduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "row",
        }}
      >
        {/* ── LEFT — Illustration panel ── */}
        <motion.div
          className="snackro-login-left"
          initial={shouldReduce ? false : "hidden"}
          animate="show"
          variants={leftPanelVariant}
          style={{
            flex: 1,
            minHeight: "100vh",
            // background:
            //   "linear-gradient(145deg, var(--color-orange-500, #f97316) 0%, #c2390b 100%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
            position: "relative",
            padding: "var(--space-8)",
          }}
        >
          {/* Decorative circles */}
          <div
            style={{
              position: "absolute",
              top: -60,
              left: -60,
              width: 240,
              height: 240,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.07)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              bottom: -80,
              right: -80,
              width: 360,
              height: 360,
              borderRadius: "50%",
              backgroundColor: "rgba(255,255,255,0.05)",
              pointerEvents: "none",
            }}
          />

          <motion.div
            initial={shouldReduce ? false : "hidden"}
            animate="show"
            variants={illustrationVariant}
            style={{
              width: "min(100%, 420px)",
              position: "relative",
              zIndex: 1,
            }}
          >
            <RunningWoman />
          </motion.div>

          {/* Tagline below illustration */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4, ease: "easeOut" }}
            style={{
              textAlign: "center",
              zIndex: 1,
              marginTop: "var(--space-4)",
            }}
          >
            <Typography
              variant="h3"
              style={{
                color: "var(--color-orange-500",
                fontWeight: 700,
                marginBottom: "var(--space-2)",
              }}
            >
              Fuel every rep.
            </Typography>
            <Typography
              variant="body"
              style={{
                color: "var(--color-text-secondary)",
                maxWidth: 280,
                margin: "0 auto",
              }}
            >
              Track your daily protein and hit your nutrition goals with
              precision.
            </Typography>
          </motion.div>
        </motion.div>

        {/* ── RIGHT — Form panel ── */}
        <div
          style={{
            flex: 1,
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "var(--color-bg-primary)",
            padding: "var(--space-4)",
          }}
        >
          {/* Top bar: theme toggle */}
          <motion.div
            initial={shouldReduce ? false : { opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.05 }}
            style={{
              display: "flex",
              justifyContent: "flex-end",
              marginBottom: "var(--space-4)",
            }}
          >
            <ThemeToggle />
          </motion.div>

          {/* Centred card */}
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Container maxWidth="440px">
              {/* Card rises up */}
              <motion.div
                initial={shouldReduce ? false : "hidden"}
                animate="show"
                variants={fadeUp}
              >
                <Card padding="var(--space-8)">
                  {/* Stagger inner children */}
                  <motion.div
                    initial="hidden"
                    animate="show"
                    variants={staggerContainer}
                  >
                    <Stack gap="var(--space-6)" align="center">
                      {/* Logo + brand */}
                      <motion.div
                        variants={childFadeUp}
                        style={{ width: "100%" }}
                      >
                        <Stack gap="var(--space-3)" align="center">
                          <motion.div variants={logoVariant}>
                            <SnackroSVGLogo />
                          </motion.div>
                          <Stack gap="var(--space-1)" align="center">
                            {/* <Typography
                              variant="h2"
                              style={{ textAlign: "center" }}
                            >
                              SNACKRO
                            </Typography> */}
                            <Typography
                              variant="caption"
                              color="var(--color-text-secondary)"
                              style={{ textAlign: "center" }}
                            >
                              Track your protein. Fuel your goals.
                            </Typography>
                          </Stack>
                        </Stack>
                      </motion.div>

                      {/* Divider */}
                      <motion.div
                        variants={childFadeUp}
                        style={{
                          width: "100%",
                          height: 1,
                          backgroundColor: "var(--color-border-strong)",
                        }}
                      />

                      {/* Inline error (fallback for edge cases) */}
                      {error && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
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
                        </motion.div>
                      )}

                      {/* Existing user: Continue with Google */}
                      <motion.div
                        variants={childFadeUp}
                        style={{ width: "100%" }}
                      >
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
                              transition: "opacity 0.2s",
                            }}
                          >
                            <GoogleLogin
                              onSuccess={handleGoogleSuccess}
                              onError={() =>
                                toast.error(
                                  "Google sign-in failed. Please try again.",
                                )
                              }
                              text="continue_with"
                              shape="rectangular"
                              theme="outline"
                              size="large"
                              width="320"
                            />
                          </div>
                        </Stack>
                      </motion.div>

                      {/* Visual separator */}
                      <motion.div
                        variants={childFadeUp}
                        style={{ width: "100%" }}
                      >
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
                      </motion.div>

                      {/* New user: Create account */}
                      <motion.div
                        variants={childFadeUp}
                        style={{ width: "100%" }}
                      >
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
                      </motion.div>
                    </Stack>
                  </motion.div>
                </Card>
              </motion.div>
            </Container>
          </div>
        </div>
      </motion.div>
    </>
  );
}
