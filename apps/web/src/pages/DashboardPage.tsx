/**
 * Dashboard Page — Main authenticated view
 *
 * Animations (framer-motion):
 *   • Header slides in from top on mount
 *   • Welcome text fades in from left
 *   • Protein hero scales + fades in, protein number counts up
 *   • Body metric cards stagger up
 *   • Profile + lifestyle cards slide in from sides
 *   • Coming-soon cards stagger in with extra delay
 *   • All animations gated by useReducedMotion() for accessibility
 */
import { useMemo, useEffect, useRef } from "react";
import type { ComponentType, SVGProps } from "react";
import {
  Activity,
  Award,
  BarChart2,
  Battery,
  Calendar,
  Coffee,
  Droplet,
  LogOut,
  Mail,
  PieChart,
  RefreshCw,
  Target,
  Thermometer,
  TrendingUp,
  User,
  Zap,
} from "react-feather";
import {
  motion,
  useReducedMotion,
  useMotionValue,
  useTransform,
  animate,
} from "framer-motion";
import { useAuth } from "@snackro/features";
import { Button, Card, Stack, Typography, Container } from "@snackro/ui";
import { ThemeToggle } from "../components/ThemeToggle";
import { SnackroLogo } from "../components/SnackroLogo";

// ─── Type shorthand ────────────────────────────────────────────

type FeatherIcon = ComponentType<
  SVGProps<SVGSVGElement> & {
    size?: number | string;
    strokeWidth?: number | string;
  }
>;

// ─── Helpers ──────────────────────────────────────────────────

function calcBMI(weightKg: number, heightCm: number): number {
  const h = heightCm / 100;
  return Math.round((weightKg / (h * h)) * 10) / 10;
}

function getBMICategory(bmi: number): { label: string; color: string } {
  if (bmi < 18.5) return { label: "Underweight", color: "#f59e0b" };
  if (bmi < 25) return { label: "Normal weight", color: "#16a34a" };
  if (bmi < 30) return { label: "Overweight", color: "#f59e0b" };
  return { label: "Obese", color: "#ef4444" };
}

// ─── Lifestyle metadata ───────────────────────────────────────

interface LifestyleMeta {
  label: string;
  Icon: FeatherIcon;
  description: string;
}

const LIFESTYLE_META: Record<string, LifestyleMeta> = {
  sedentary: {
    Icon: Coffee,
    label: "Sedentary",
    description: "Office work, minimal movement",
  },
  lightly_active: {
    Icon: Activity,
    label: "Lightly Active",
    description: "Light exercise 1-2 days/week",
  },
  regular_exercise: {
    Icon: Zap,
    label: "Regular Exercise",
    description: "Moderate workouts 3-5 days/week",
  },
  recomposition: {
    Icon: RefreshCw,
    label: "Body Recomposition",
    description: "Build muscle while losing fat",
  },
  muscle_building: {
    Icon: TrendingUp,
    label: "Muscle Building",
    description: "Focused hypertrophy training",
  },
  aggressive_bodybuilding: {
    Icon: Award,
    label: "Aggressive Bodybuilding",
    description: "High-volume intensive training",
  },
};

// ─── Coming-soon data ─────────────────────────────────────────

interface ComingSoonItem {
  Icon: FeatherIcon;
  title: string;
  description: string;
}

const COMING_SOON_ITEMS: ComingSoonItem[] = [
  {
    Icon: Thermometer,
    title: "Basal Metabolic Rate",
    description: "Calories your body burns at rest",
  },
  {
    Icon: Battery,
    title: "Total Daily Energy",
    description: "TDEE based on your activity level",
  },
  {
    Icon: Droplet,
    title: "Daily Water Intake",
    description: "Optimal daily hydration target",
  },
  {
    Icon: Target,
    title: "Ideal Body Weight",
    description: "Target weight for your height",
  },
  {
    Icon: PieChart,
    title: "Macro Breakdown",
    description: "Carbs, fats and protein ratio",
  },
  {
    Icon: BarChart2,
    title: "Progress Tracking",
    description: "Weight and metric history over time",
  },
];

// ─── Animation variants ───────────────────────────────────────

const headerAnim = {
  hidden: { y: -28, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 340, damping: 28 },
  },
};

const fadeLeft = {
  hidden: { x: -22, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
};

const heroAnim = {
  hidden: { scale: 0.96, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 280,
      damping: 24,
      delay: 0.12,
    },
  },
};

const sectionTitle = {
  hidden: { x: -16, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

const staggerWrap = (delay = 0.2) => ({
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: delay } },
});

const cardUp = {
  hidden: { y: 20, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 280, damping: 24 },
  },
};

const slideRight = {
  hidden: { x: -24, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 22,
      delay: 0.1,
    },
  },
};

const slideLeft = {
  hidden: { x: 24, opacity: 0 },
  show: {
    x: 0,
    opacity: 1,
    transition: {
      type: "spring" as const,
      stiffness: 260,
      damping: 22,
      delay: 0.15,
    },
  },
};

const comingSoonItem = {
  hidden: { y: 14, opacity: 0 },
  show: {
    y: 0,
    opacity: 1,
    transition: { type: "spring" as const, stiffness: 260, damping: 22 },
  },
};

// ─── Sub-components ───────────────────────────────────────────

/** Animated count-up for the protein number */
function ProteinNumber({ target }: { target: number | null | undefined }) {
  const shouldReduce = useReducedMotion();
  const count = useMotionValue(0);
  const displayed = useTransform(count, (v) => Math.round(v).toString());
  const hasAnimated = useRef(false);

  useEffect(() => {
    if (target == null || hasAnimated.current) return;
    hasAnimated.current = true;
    if (shouldReduce) {
      count.set(target);
      return;
    }
    const controls = animate(count, target, {
      duration: 1.1,
      ease: "easeOut",
      delay: 0.25,
    });
    return () => controls.stop();
  }, [target, shouldReduce, count]);

  return (
    <motion.span
      style={{
        fontSize: "clamp(52px, 10vw, 80px)",
        fontWeight: 800,
        color: "#fff",
        lineHeight: 1,
        fontFamily: "var(--font-sans)",
      }}
    >
      {target == null ? "—" : displayed}
    </motion.span>
  );
}

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string;
  value: string | number | null | undefined;
  unit?: string;
  accent?: string;
}) {
  return (
    <motion.div variants={cardUp} style={{ flex: "1 1 150px", minWidth: 150 }}>
      <Card padding="var(--space-5)">
        <Stack gap="var(--space-2)">
          <Typography variant="caption" color="var(--color-text-secondary)">
            {label}
          </Typography>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <Typography
              variant="h3"
              style={{
                lineHeight: 1,
                color: accent ?? "var(--color-text-primary)",
              }}
            >
              {value ?? "—"}
            </Typography>
            {unit != null && value != null && (
              <Typography variant="caption" color="var(--color-text-secondary)">
                {unit}
              </Typography>
            )}
          </div>
        </Stack>
      </Card>
    </motion.div>
  );
}

function ComingSoonCard({ Icon, title, description }: ComingSoonItem) {
  const shouldReduce = useReducedMotion();
  return (
    <motion.div
      variants={comingSoonItem}
      whileHover={
        shouldReduce
          ? {}
          : { y: -3, scale: 1.02, transition: { duration: 0.14 } }
      }
      style={{ flex: "1 1 175px", minWidth: 165 }}
    >
      <Card
        padding="var(--space-4)"
        style={{
          height: "100%",
          opacity: 0.72,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 10,
            right: 10,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.07em",
            padding: "2px 7px",
            borderRadius: 9999,
            backgroundColor: "#ffedd5",
            color: "#ea580c",
            fontFamily: "var(--font-sans)",
          }}
        >
          SOON
        </div>
        <Stack gap="var(--space-3)">
          <Icon size={20} strokeWidth={1.75} color="var(--color-text-muted)" />
          <Stack gap="var(--space-1)">
            <Typography variant="label" color="var(--color-text-primary)">
              {title}
            </Typography>
            <Typography variant="caption" color="var(--color-text-secondary)">
              {description}
            </Typography>
          </Stack>
        </Stack>
      </Card>
    </motion.div>
  );
}

interface ProfileRowProps {
  Icon: FeatherIcon;
  label: string;
  value: string | null | undefined;
}
function ProfileRow({ Icon, label, value }: ProfileRowProps) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 16,
        paddingBottom: "var(--space-3)",
        borderBottom: "1px solid var(--color-border-soft)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          flexShrink: 0,
        }}
      >
        <Icon size={13} strokeWidth={2} color="var(--color-text-muted)" />
        <Typography variant="caption" color="var(--color-text-secondary)">
          {label}
        </Typography>
      </div>
      <Typography
        variant="body"
        style={{ textAlign: "right", wordBreak: "break-all" }}
      >
        {value ?? "—"}
      </Typography>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────

export function DashboardPage() {
  const { user, logout, isLoading } = useAuth();
  const shouldReduce = useReducedMotion();

  const bmi = useMemo(() => {
    if (user?.weight_kg != null && user.height_cm != null)
      return calcBMI(user.weight_kg, user.height_cm);
    return null;
  }, [user?.weight_kg, user?.height_cm]);

  const bmiFeedback = bmi != null ? getBMICategory(bmi) : null;
  const lifestyle = user?.lifestyle ? LIFESTYLE_META[user.lifestyle] : null;

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      })
    : null;

  const firstName = user?.full_name?.split(" ")[0] ?? "there";

  const gate = shouldReduce
    ? { initial: false, animate: "show" }
    : { initial: "hidden", animate: "show" };

  return (
    <div
      style={{ minHeight: "100vh", backgroundColor: "var(--color-bg-primary)" }}
    >
      {/* ── Header ── */}
      <motion.header
        {...gate}
        variants={shouldReduce ? {} : headerAnim}
        style={{
          backgroundColor: "var(--color-bg-secondary)",
          borderBottom: "1px solid var(--color-border-strong)",
          padding: "var(--space-3) var(--space-4)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <Container>
          <Stack direction="row" align="center" justify="space-between">
            <Stack direction="row" align="center" gap="var(--space-2)">
              <SnackroLogo size={32} />
              <Typography variant="h4">SNACKRO</Typography>
            </Stack>
            <Stack direction="row" align="center" gap="var(--space-3)">
              <ThemeToggle />
              {user?.avatar_url && (
                <img
                  src={user.avatar_url}
                  alt={user.full_name ?? "Avatar"}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "50%",
                    border: "1px solid var(--color-border-strong)",
                  }}
                />
              )}
              <Typography variant="label" color="var(--color-text-secondary)">
                {user?.full_name ?? user?.email}
              </Typography>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                loading={isLoading}
              >
                <Stack direction="row" align="center" gap="var(--space-1)">
                  <LogOut size={13} strokeWidth={2} />
                  <span>Sign Out</span>
                </Stack>
              </Button>
            </Stack>
          </Stack>
        </Container>
      </motion.header>

      {/* ── Main ── */}
      <main style={{ padding: "var(--space-6) var(--space-4)" }}>
        <Container maxWidth="960px">
          <Stack gap="var(--space-8)">
            {/* ── Welcome ── */}
            <motion.div {...gate} variants={shouldReduce ? {} : fadeLeft}>
              <Stack gap="var(--space-1)">
                <Typography variant="h2">Welcome back, {firstName}!</Typography>
                <Typography variant="body" color="var(--color-text-secondary)">
                  Here&apos;s your personal nutrition overview.
                </Typography>
              </Stack>
            </motion.div>

            {/* ── Protein hero ── */}
            <motion.div {...gate} variants={shouldReduce ? {} : heroAnim}>
              <div
                style={{
                  padding: "var(--space-6) var(--space-7)",
                  borderRadius: "var(--radius-md)",
                  background:
                    "linear-gradient(135deg, var(--color-orange-500), #d4460e)",
                  border: "1px solid rgba(0,0,0,0.08)",
                }}
              >
                <Stack gap="var(--space-2)">
                  <Typography
                    variant="caption"
                    style={{
                      color: "rgba(255,255,255,0.82)",
                      letterSpacing: "0.08em",
                      textTransform: "uppercase",
                    }}
                  >
                    Daily Protein Target
                  </Typography>
                  <div
                    style={{ display: "flex", alignItems: "baseline", gap: 8 }}
                  >
                    <ProteinNumber target={user?.daily_protein_target} />
                    <span
                      style={{
                        fontSize: 20,
                        fontWeight: 500,
                        color: "rgba(255,255,255,0.85)",
                      }}
                    >
                      g / day
                    </span>
                  </div>
                  {(lifestyle != null || user?.weight_kg != null) && (
                    <Typography
                      variant="caption"
                      style={{ color: "rgba(255,255,255,0.72)" }}
                    >
                      {lifestyle != null ? lifestyle.label : ""}
                      {user?.weight_kg != null
                        ? ` · ${user.weight_kg} kg bodyweight`
                        : ""}
                    </Typography>
                  )}
                </Stack>
              </div>
            </motion.div>

            {/* ── Body metrics ── */}
            <Stack gap="var(--space-4)">
              <motion.div {...gate} variants={shouldReduce ? {} : sectionTitle}>
                <Typography variant="h4">Body Metrics</Typography>
              </motion.div>
              <motion.div
                {...gate}
                variants={shouldReduce ? {} : staggerWrap(0.2)}
                style={{ display: "flex", flexWrap: "wrap", gap: 16 }}
              >
                <StatCard label="Weight" value={user?.weight_kg} unit="kg" />
                <StatCard label="Height" value={user?.height_cm} unit="cm" />
                <StatCard
                  label="BMI"
                  value={bmi}
                  unit={bmiFeedback?.label}
                  accent={bmiFeedback?.color}
                />
              </motion.div>
            </Stack>

            {/* ── Profile + Lifestyle ── */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
              <motion.div
                {...gate}
                variants={shouldReduce ? {} : slideRight}
                style={{ flex: "2 1 280px" }}
              >
                <Card padding="var(--space-5)" style={{ height: "100%" }}>
                  <Stack gap="var(--space-4)">
                    <Typography variant="h4">Profile</Typography>
                    <Stack gap="var(--space-3)">
                      <ProfileRow
                        Icon={User}
                        label="Full name"
                        value={user?.full_name}
                      />
                      <ProfileRow
                        Icon={Mail}
                        label="Email address"
                        value={user?.email}
                      />
                      <ProfileRow
                        Icon={Calendar}
                        label="Member since"
                        value={memberSince}
                      />
                    </Stack>
                  </Stack>
                </Card>
              </motion.div>

              {lifestyle != null && (
                <motion.div
                  {...gate}
                  variants={shouldReduce ? {} : slideLeft}
                  style={{ flex: "1 1 200px" }}
                >
                  <Card padding="var(--space-5)" style={{ height: "100%" }}>
                    <Stack gap="var(--space-4)">
                      <Typography variant="h4">Lifestyle Goal</Typography>
                      <Stack gap="var(--space-3)">
                        <lifestyle.Icon
                          size={28}
                          strokeWidth={1.75}
                          color="var(--color-orange-500)"
                        />
                        <Stack gap="var(--space-1)">
                          <Typography
                            variant="h4"
                            style={{
                              color: "var(--color-orange-600, #ea580c)",
                            }}
                          >
                            {lifestyle.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            color="var(--color-text-secondary)"
                          >
                            {lifestyle.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* ── Coming soon ── */}
            <Stack gap="var(--space-4)">
              <motion.div {...gate} variants={shouldReduce ? {} : sectionTitle}>
                <Stack direction="row" align="center" gap="var(--space-3)">
                  <Typography variant="h4">Health Parameters</Typography>
                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      padding: "2px 10px",
                      borderRadius: 9999,
                      backgroundColor: "#ffedd5",
                      color: "#ea580c",
                      fontFamily: "var(--font-sans)",
                    }}
                  >
                    COMING SOON
                  </span>
                </Stack>
              </motion.div>
              <motion.div {...gate} variants={shouldReduce ? {} : sectionTitle}>
                <Typography
                  variant="caption"
                  color="var(--color-text-secondary)"
                >
                  Advanced health metrics will be available in a future update.
                </Typography>
              </motion.div>
              <motion.div
                {...gate}
                variants={shouldReduce ? {} : staggerWrap(0.4)}
                style={{ display: "flex", flexWrap: "wrap", gap: 12 }}
              >
                {COMING_SOON_ITEMS.map(({ Icon, title, description }) => (
                  <ComingSoonCard
                    key={title}
                    Icon={Icon}
                    title={title}
                    description={description}
                  />
                ))}
              </motion.div>
            </Stack>
          </Stack>
        </Container>
      </main>
    </div>
  );
}
