/**
 * CompleteProfilePage — 3-step signup wizard for new SNACKRO users.
 *
 * Step 1 — Personal details  : email + full_name
 * Step 2 — Body metrics      : weight_kg + height_cm
 * Step 3 — Lifestyle goal    : visual card selector
 *
 * On submit → POST /api/v1/users → window.alert → navigate("/login")
 *
 * This is a PUBLIC route — no auth required.
 */
import { useState } from "react";
import type { ComponentType, SVGProps } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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

// ─── Lifestyle data ───────────────────────────────────────────

// Feather icon component type
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

// ─── Step Progress Bar ────────────────────────────────────────

function StepBar({ current, total }: { current: number; total: number }) {
  const LABELS = ["Personal details", "Body metrics", "Lifestyle"];
  return (
    <Stack gap="var(--space-3)" style={{ marginBottom: "var(--space-5)" }}>
      {/* Segment bar */}
      <div style={{ display: "flex", gap: 4 }}>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 9999,
              backgroundColor:
                i < current
                  ? "var(--color-orange-500)"
                  : "var(--color-border-soft)",
              transition: "background-color 0.25s",
            }}
          />
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

// ─── Error helper ─────────────────────────────────────────────

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <Typography
      variant="caption"
      style={{ color: "var(--color-error-text)", marginTop: "var(--space-1)" }}
    >
      {message}
    </Typography>
  );
}

// ─── Main Page ────────────────────────────────────────────────

export function CompleteProfilePage() {
  const navigate = useNavigate();
  const [createUser, { isLoading }] = useCreateUserMutation();
  const [checkUserByEmail] = useLazyGetUserProfileQuery();

  // Step-1 email-existence check state
  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);

  // Wizard state
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [step1Data, setStep1Data] = useState<Step1Data | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Data | null>(null);
  const [lifestyle, setLifestyle] = useState<LifestyleGoal | null>(null);
  const [lifestyleError, setLifestyleError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // ── Step 1 form ──
  const {
    register: reg1,
    handleSubmit: handle1,
    formState: { errors: errors1 },
  } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: step1Data ?? undefined,
  });

  // ── Step 2 form ──
  const {
    register: reg2,
    handleSubmit: handle2,
    formState: { errors: errors2 },
  } = useForm<Step2Data>({
    resolver: zodResolver(step2Schema),
    defaultValues: step2Data ?? undefined,
  });

  const onStep1 = async (data: Step1Data) => {
    setEmailExistsError(null);
    setIsCheckingEmail(true);
    try {
      await checkUserByEmail(data.email).unwrap();
      // unwrap() resolves only when the server returns 200 — meaning the
      // email is already registered.
      setEmailExistsError(
        "This email is already registered. Please sign in with Google instead.",
      );
      return; // stay on Step 1
    } catch (err: unknown) {
      const status =
        err && typeof err === "object" && "status" in err
          ? (err as { status: number }).status
          : 0;
      // 404 → user not found → expected happy path for new accounts
      // 401 / network errors → fail-open (don't block signup)
      if (status !== 404) {
        // non-404: silently ignored — proceed
      }
    } finally {
      setIsCheckingEmail(false);
    }
    setStep1Data(data);
    setStep(2);
  };

  const onStep2 = (data: Step2Data) => {
    setStep2Data(data);
    setStep(3);
  };

  const onSubmit = async () => {
    if (!lifestyle) {
      setLifestyleError("Please select a lifestyle goal");
      return;
    }
    if (!step1Data || !step2Data) return;

    setSubmitError(null);
    try {
      await createUser({
        email: step1Data.email,
        full_name: step1Data.full_name,
        weight_kg: step2Data.weight_kg,
        height_cm: step2Data.height_cm,
        lifestyle,
      }).unwrap();

      window.alert("Your details have been stored. You can now sign in.");
      navigate("/login", { replace: true });
    } catch (err: unknown) {
      const message =
        err && typeof err === "object" && "data" in err
          ? String((err as { data?: unknown }).data) ||
            "Failed to create account"
          : err instanceof Error
            ? err.message
            : "Failed to create account";
      setSubmitError(message);
    }
  };

  return (
    <div
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
        {/* Header */}
        <Stack
          gap="var(--space-2)"
          align="center"
          style={{ marginBottom: "var(--space-6)" }}
        >
          <SnackroLogo size={48} />
          <Typography variant="h2" style={{ textAlign: "center" }}>
            Create your account
          </Typography>
          <Typography
            variant="caption"
            color="var(--color-text-secondary)"
            style={{ textAlign: "center" }}
          >
            Fill in your details so we can personalise your protein targets.
          </Typography>
        </Stack>

        <StepBar current={step} total={3} />

        <Card padding="var(--space-6)">
          {/* ── STEP 1: Personal details ── */}
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
                  <FieldError message={errors1.email?.message} />
                </Stack>

                <Stack gap="var(--space-1)">
                  <Input
                    label="Full name"
                    type="text"
                    placeholder="e.g. Jane Smith"
                    fullWidth
                    {...reg1("full_name")}
                  />
                  <FieldError message={errors1.full_name?.message} />
                </Stack>

                {emailExistsError && (
                  <div
                    style={{
                      padding: "var(--space-3) var(--space-4)",
                      borderRadius: "var(--radius-sm)",
                      backgroundColor: "var(--color-warning-bg)",
                      border: "1px solid var(--color-warning-border)",
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
                  </div>
                )}

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
                    <Stack direction="row" align="center" gap="var(--space-1)">
                      <span>Next</span>
                      <ArrowRight size={14} strokeWidth={2.25} />
                    </Stack>
                  )}
                </Button>
              </Stack>
            </form>
          )}

          {/* ── STEP 2: Body metrics ── */}
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
                    <FieldError message={errors2.weight_kg?.message} />
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
                    <FieldError message={errors2.height_cm?.message} />
                  </Stack>
                </Stack>

                <Stack direction="row" gap="var(--space-3)">
                  <Button
                    type="button"
                    variant="ghost"
                    style={{ flex: 1 }}
                    onClick={() => setStep(1)}
                  >
                    <Stack direction="row" align="center" gap="var(--space-1)">
                      <ArrowLeft size={14} strokeWidth={2.25} />
                      <span>Back</span>
                    </Stack>
                  </Button>
                  <Button type="submit" variant="primary" style={{ flex: 2 }}>
                    <Stack direction="row" align="center" gap="var(--space-1)">
                      <span>Next</span>
                      <ArrowRight size={14} strokeWidth={2.25} />
                    </Stack>
                  </Button>
                </Stack>
              </Stack>
            </form>
          )}

          {/* ── STEP 3: Lifestyle ── */}
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
                  ({ value, label, Icon, description }) => {
                    const active = lifestyle === value;
                    return (
                      <button
                        key={value}
                        type="button"
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
                      </button>
                    );
                  },
                )}
              </div>

              {lifestyleError && <FieldError message={lifestyleError} />}

              {submitError && (
                <div
                  style={{
                    padding: "var(--space-3)",
                    borderRadius: "var(--radius-sm)",
                    backgroundColor: "var(--color-error-bg)",
                    border: "1px solid var(--color-error-border)",
                  }}
                >
                  <Typography
                    variant="caption"
                    style={{ color: "var(--color-error-text)" }}
                  >
                    {submitError}
                  </Typography>
                </div>
              )}

              <Stack direction="row" gap="var(--space-3)">
                <Button
                  type="button"
                  variant="ghost"
                  style={{ flex: 1 }}
                  onClick={() => setStep(2)}
                  disabled={isLoading}
                >
                  <Stack direction="row" align="center" gap="var(--space-1)">
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
                  {isLoading ? "Creating account…" : "Create account"}
                </Button>
              </Stack>
            </Stack>
          )}
        </Card>

        {/* Back to login */}
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
      </Container>
    </div>
  );
}
