/**
 * CompleteProfilePage — 3-step signup wizard with animated step transitions.
 *
 * Step 1 — Personal details  : email + full_name (+ duplicate-email check)
 * Step 2 — Body metrics      : weight_kg + height_cm
 * Step 3 — Lifestyle goal    : animated card selector
 *
 * Animations (framer-motion):
 *   • Header logo + title fade in from top
 *   • Step card slides left/right based on direction
 *   • Lifestyle option cards stagger in
 *
 * Toasts (react-hot-toast):
 *   • Success toast on account creation (replaces window.alert)
 *   • Error toast on API failures
 */
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import toast from "react-hot-toast";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  Award,
  Coffee,
  RefreshCw,
  TrendingUp,
  Zap,
} from "react-feather";
import {
  useCreateUserMutation,
  useLazyGetUserProfileQuery,
} from "@snackro/features";
import type { LifestyleGoal } from "@snackro/types";
import { Button, Card, Stack, Typography, Container, Input } from "@snackro/ui";
import { SnackroLogo } from "../components/SnackroLogo";

// ─── Zod schemas ──────────────────────────────────────────────

const step1Schema = z.object({
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  full_name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(120, "Name must be 120 characters or less"),
});

const step2Schema = z.object({
  weight_kg: z
    .number()
    .gt(20, "Weight must be greater than 20 kg")
    .max(300, "Weight must be 300 kg or less"),
  height_cm: z
    .number()
    .gt(50, "Height must be greater than 50 cm")
    .max(300, "Height must be 300 cm or less"),
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

// ─── Types ────────────────────────────────────────────────────

type FeatherIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
  }
>;

interface LifestyleOption {
  value: LifestyleGoal;
  label: string;
  description: string;
  Icon: FeatherIcon;
}

// ─── Lifestyle options ────────────────────────────────────────

const LIFESTYLE_OPTIONS: LifestyleOption[] = [
  {
    value: "sedentary",
    label: "Sedentary",
    Icon: Coffee,
    description: "Office work, minimal movement",
  },
  {
    value: "lightly_active",
    label: "Lightly Active",
    Icon: Activity,
    description: "Light exercise 1-2 days/week",
  },
  {
    value: "regular_exercise",
    label: "Regular Exercise",
    Icon: Zap,
    description: "Moderate workouts 3-5 days/week",
  },
  {
    value: "recomposition",
    label: "Body Recomposition",
    Icon: RefreshCw,
    description: "Build muscle while losing fat",
  },
  {
    value: "muscle_building",
    label: "Muscle Building",
    Icon: TrendingUp,
    description: "Focused hypertrophy training",
  },
  {
    value: "aggressive_bodybuilding",
    label: "Aggressive Bodybuilding",
    Icon: Award,
    description: "High-volume intensive training",
  },
];

// ─── Animation variants ───────────────────────────────────────

function makeStepVariants(dir: number) {
  return {
    initial: {
      opacity: 0,
      x: dir > 0 ? 48 : -48,
    },
    animate: {
      opacity: 1,
      x: 0,
      transition: { type: "spring" as const, stiffness: 340, damping: 30 },
    },
    exit: {
      opacity: 0,
      x: dir > 0 ? -48 : 48,
      transition: { duration: 0.18 },
    },
  };
}

const headerVariants = {
  hidden: { opacity: 0, y: -18 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 320,
      damping: 28,
      delayChildren: 0.1,
      staggerChildren: 0.07,
    },
  },
};

const headerChild = {
  hidden: { opacity: 0, y: -12 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
};

const lifestyleItemVariant = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
      delay: i * 0.06,
    },
  }),
};

// ─── Sub-components ───────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  const LABELS = ["Personal details", "Body metrics", "Lifestyle"];
  return (
    <Stack gap="var(--space-3)" style={{ marginBottom: "var(--space-5)" }}>
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              backgroundColor: "var(--color-border-soft)",
              overflow: "hidden",
            }}
          >
            <motion.div
              style={{
                height: "100%",
                backgroundColor: "var(--color-orange-500)",
                borderRadius: 9999,
              }}
              initial={{ width: i < current - 1 ? "100%" : "0%" }}
              animate={{ width: i < current ? "100%" : "0%" }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            />
          </div>
        ))}
      </div>
      <Typography
        variant="caption"
        color="var(--color-text-secondary)"
        style={{ textAlign: "center" }}
      >
        Step {current} of {total} — {LABELS[current - 1]}
      </Typography>
    </Stack>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.18 }}
    >
      <Typography
        variant="caption"
        style={{
          color: "var(--color-error-text)",
          marginTop: "var(--space-1)",
        }}
      >
        {message}
      </Typography>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const shouldReduce = useReducedMotion();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [checkUserByEmail] = useLazyGetUserProfileQuery();

  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState(1); // 1 = forward, -1 = backward
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleGoal | null>(null);
  const [lifestyleError, setLifestyleError] = useState<string | null>(null);

  const {
    register: reg1,
    handleSubmit: handle1,
    formState: { errors: errors1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data ?? undefined,
  });

  const {
    register: reg2,
    handleSubmit: handle2,
    formState: { errors: errors2 },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data ?? undefined,
  });

  function goTo(next: 1 | 2 | 3) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  const onStep1 = async (data: Step1Data) => {
    setEmailExistsError(null);
    setIsCheckingEmail(true);
    try {
      await checkUserByEmail(data.email).unwrap();
      setEmailExistsError(
        "This email is already registered. Please sign in with Google instead.",
      );
      return;
    } catch (err: unknown) {
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status
          : 0;
      if (status !== 404) {
        // non-404 errors: fail-open and proceed
      }
    } finally {
      setIsCheckingEmail(false);
    }
    setStep1Data(data);
    goTo(2);
  };

  const onStep2 = (data: Step2Data) => {
    setStep2Data(data);
    goTo(3);
  };

  const onSubmit = async () => {
    if (!lifestyle) {
      setLifestyleError("Please select a lifestyle goal");
      return;
    }
    if (!step1Data || !step2Data) return;

    try {
      await createUser({
        email: step1Data.email,
        full_name: step1Data.full_name,
        weight_kg: step2Data.weight_kg,
        height_cm: step2Data.height_cm,
        lifestyle,
      }).unwrap();

      toast.success("Account created! You can now sign in with Google.", {
        duration: 5000,
        icon: "🎉",
      });
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: unknown }).data) ||
            "Failed to create account"
          : err instanceof Error
            ? err.message
            : "Failed to create account";
      toast.error(message);
    }
  };

  const stepVariants = shouldReduce
    ? { initial: {}, animate: {}, exit: {} }
    : makeStepVariants(direction);

  return (
    <motion.div
      initial={shouldReduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      style={{
        minHeight: "100vh",
        backgroundColor: "var(--color-bg-primary)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        padding: "var(--space-8) var(--space-4)",
      }}
    >
      <Container maxWidth="520px">
        {/* ── Header ── */}
        <motion.div
          initial="hidden"
          animate="show"
          variants={shouldReduce ? {} : headerVariants}
        >
          <Stack
            gap="var(--space-2)"
            align="center"
            style={{ marginBottom: "var(--space-6)" }}
          >
            <motion.div variants={shouldReduce ? {} : headerChild}>
              <SnackroLogo size={48} />
            </motion.div>
            <motion.div variants={shouldReduce ? {} : headerChild}>
              <Typography variant="h2" style={{ textAlign: "center" }}>
                Create your account
              </Typography>
            </motion.div>
            <motion.div variants={shouldReduce ? {} : headerChild}>
              <Typography
                variant="caption"
                color="var(--color-text-secondary)"
                style={{ textAlign: "center" }}
              >
                Fill in your details so we can personalise your protein targets.
              </Typography>
            </motion.div>
          </Stack>
        </motion.div>

        <StepBar current={step} total={3} />

        <Card padding="var(--space-6)" style={{ overflow: "hidden" }}>
          {/* AnimatePresence drives the step slide transitions */}
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={step}
              initial={stepVariants.initial}
              animate={stepVariants.animate}
              exit={stepVariants.exit}
            >
              {/* ── STEP 1 ── */}
              {step === 1 && (
                <form onSubmit={handle1(onStep1)} noValidate>
                  <Stack gap="var(--space-5)">
                    <Typography variant="h4">Personal details</Typography>

                    <Stack gap="var(--space-1)">
                      <Input
                        label="Email address"
                        type="email"
                        placeholder="you@example.com"
                        fullWidth
                        {...reg1("email")}
                      />
                      <AnimatePresence>
                        {errors1.email && (
                          <FieldError message={errors1.email.message} />
                        )}
                      </AnimatePresence>
                    </Stack>

                    <Stack gap="var(--space-1)">
                      <Input
                        label="Full name"
                        type="text"
                        placeholder="e.g. Jane Smith"
                        fullWidth
                        {...reg1("full_name")}
                      />
                      <AnimatePresence>
                        {errors1.full_name && (
                          <FieldError message={errors1.full_name.message} />
                        )}
                      </AnimatePresence>
                    </Stack>

                    <AnimatePresence>
                      {emailExistsError && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, y: -8 }}
                          animate={{ opacity: 1, height: "auto", y: 0 }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.22 }}
                          style={{
                            padding: "var(--space-3) var(--space-4)",
                            borderRadius: "var(--radius-sm)",
                            backgroundColor: "var(--color-warning-bg)",
                            border: "1px solid var(--color-warning-border)",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              display: "flex",
                              alignItems: "flex-start",
                              gap: "var(--space-2)",
                              color: "var(--color-warning-text)",
                            }}
                          >
                            <AlertTriangle
                              size={14}
                              strokeWidth={2}
                              style={{ flexShrink: 0, marginTop: 1 }}
                            />
                            <Typography
                              variant="caption"
                              style={{ color: "inherit" }}
                            >
                              {emailExistsError}
                            </Typography>
                          </div>
                          <button
                            type="button"
                            onClick={() => navigate("/login")}
                            style={{
                              marginTop: 6,
                              background: "none",
                              border: "none",
                              color: "var(--color-orange-600)",
                              cursor: "pointer",
                              fontWeight: 600,
                              fontFamily: "var(--font-sans)",
                              fontSize: "0.8125rem",
                              padding: 0,
                            }}
                          >
                            <Stack
                              direction="row"
                              align="center"
                              gap="var(--space-1)"
                            >
                              <span>Sign in with Google</span>
                              <ArrowRight size={12} strokeWidth={2.5} />
                            </Stack>
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <Button
                      type="submit"
                      variant="primary"
                      style={{ width: "100%" }}
                      disabled={isCheckingEmail}
                      loading={isCheckingEmail}
                    >
                      {isCheckingEmail ? (
                        "Checking..."
                      ) : (
                        <Stack
                          direction="row"
                          align="center"
                          gap="var(--space-1)"
                        >
                          <span>Next</span>
                          <ArrowRight size={14} strokeWidth={2.25} />
                        </Stack>
                      )}
                    </Button>
                  </Stack>
                </form>
              )}

              {/* ── STEP 2 ── */}
              {step === 2 && (
                <form onSubmit={handle2(onStep2)} noValidate>
                  <Stack gap="var(--space-5)">
                    <Typography variant="h4">Body metrics</Typography>
                    <Stack direction="row" gap="var(--space-3)">
                      <Stack gap="var(--space-1)" style={{ flex: 1 }}>
                        <Input
                          label="Weight (kg)"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 75"
                          fullWidth
                          {...reg2("weight_kg", { valueAsNumber: true })}
                        />
                        <AnimatePresence>
                          {errors2.weight_kg && (
                            <FieldError message={errors2.weight_kg.message} />
                          )}
                        </AnimatePresence>
                      </Stack>
                      <Stack gap="var(--space-1)" style={{ flex: 1 }}>
                        <Input
                          label="Height (cm)"
                          type="number"
                          step="0.1"
                          placeholder="e.g. 175"
                          fullWidth
                          {...reg2("height_cm", { valueAsNumber: true })}
                        />
                        <AnimatePresence>
                          {errors2.height_cm && (
                            <FieldError message={errors2.height_cm.message} />
                          )}
                        </AnimatePresence>
                      </Stack>
                    </Stack>
                    <Stack direction="row" gap="var(--space-3)">
                      <Button
                        type="button"
                        variant="ghost"
                        style={{ flex: 1 }}
                        onClick={() => goTo(1)}
                      >
                        <Stack
                          direction="row"
                          align="center"
                          gap="var(--space-1)"
                        >
                          <ArrowLeft size={14} strokeWidth={2.25} />
                          <span>Back</span>
                        </Stack>
                      </Button>
                      <Button
                        type="submit"
                        variant="primary"
                        style={{ flex: 2 }}
                      >
                        <Stack
                          direction="row"
                          align="center"
                          gap="var(--space-1)"
                        >
                          <span>Next</span>
                          <ArrowRight size={14} strokeWidth={2.25} />
                        </Stack>
                      </Button>
                    </Stack>
                  </Stack>
                </form>
              )}

              {/* ── STEP 3 ── */}
              {step === 3 && (
                <Stack gap="var(--space-5)">
                  <Stack gap="var(--space-1)">
                    <Typography variant="h4">Lifestyle goal</Typography>
                    <Typography
                      variant="caption"
                      color="var(--color-text-secondary)"
                    >
                      Choose the option that best describes your typical week.
                    </Typography>
                  </Stack>

                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "var(--space-2)",
                    }}
                  >
                    {LIFESTYLE_OPTIONS.map(
                      ({ value, label, Icon, description }, i) => {
                        const active = lifestyle === value;
                        return (
                          <motion.button
                            key={value}
                            type="button"
                            custom={i}
                            variants={shouldReduce ? {} : lifestyleItemVariant}
                            initial="hidden"
                            animate="show"
                            whileHover={
                              shouldReduce
                                ? {}
                                : {
                                    scale: 1.015,
                                    transition: { duration: 0.12 },
                                  }
                            }
                            whileTap={shouldReduce ? {} : { scale: 0.985 }}
                            onClick={() => {
                              setLifestyle(value);
                              setLifestyleError(null);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "var(--space-3)",
                              padding: "var(--space-3) var(--space-4)",
                              borderRadius: "var(--radius-sm)",
                              border: active
                                ? "2px solid var(--color-orange-500)"
                                : "2px solid var(--color-border-soft)",
                              backgroundColor: active
                                ? "var(--color-orange-50, #fff7ed)"
                                : "var(--color-bg-secondary)",
                              cursor: "pointer",
                              textAlign: "left",
                              fontFamily: "var(--font-sans)",
                              transition:
                                "border-color 0.15s, background-color 0.15s",
                            }}
                          >
                            <Icon
                              size={20}
                              strokeWidth={1.75}
                              color={
                                active
                                  ? "var(--color-orange-600, #ea580c)"
                                  : "var(--color-text-muted)"
                              }
                            />
                            <Stack gap="var(--space-0)">
                              <Typography
                                variant="label"
                                style={{
                                  color: active
                                    ? "var(--color-orange-700, #c2410c)"
                                    : "var(--color-text-primary)",
                                  fontWeight: active ? 700 : 500,
                                }}
                              >
                                {label}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="var(--color-text-secondary)"
                              >
                                {description}
                              </Typography>
                            </Stack>
                          </motion.button>
                        );
                      },
                    )}
                  </div>

                  <AnimatePresence>
                    {lifestyleError && <FieldError message={lifestyleError} />}
                  </AnimatePresence>

                  <Stack direction="row" gap="var(--space-3)">
                    <Button
                      type="button"
                      variant="ghost"
                      style={{ flex: 1 }}
                      onClick={() => goTo(2)}
                      disabled={isLoading}
                    >
                      <Stack
                        direction="row"
                        align="center"
                        gap="var(--space-1)"
                      >
                        <ArrowLeft size={14} strokeWidth={2.25} />
                        <span>Back</span>
                      </Stack>
                    </Button>
                    <Button
                      type="button"
                      variant="primary"
                      style={{ flex: 2 }}
                      onClick={onSubmit}
                      loading={isLoading}
                      disabled={isLoading}
                    >
                      {isLoading ? "Creating account..." : "Create account"}
                    </Button>
                  </Stack>
                </Stack>
              )}
            </motion.div>
          </AnimatePresence>
        </Card>

        {/* Back to login */}
        <motion.div
          initial={shouldReduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <Typography
            variant="caption"
            color="var(--color-text-secondary)"
            style={{ textAlign: "center", marginTop: "var(--space-4)" }}
          >
            Already have an account?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-orange-600)",
                cursor: "pointer",
                fontWeight: 600,
                fontFamily: "var(--font-sans)",
                fontSize: "inherit",
                padding: 0,
              }}
            >
              Sign in
            </button>
          </Typography>
        </motion.div>
      </Container>
    </motion.div>
  );
}
