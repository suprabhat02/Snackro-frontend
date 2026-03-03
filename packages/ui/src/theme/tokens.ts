/**
 * Design Tokens — centralized design system values
 *
 * Consumed as:
 * - TypeScript constants (for JS usage)
 * - CSS custom properties (via global.css)
 *
 * Platform-agnostic: These are plain values, no DOM dependency.
 */

// ─── Color Tokens ────────────────────────────────────────────

export const colors = {
  orange: {
    50: "#fff2e5",
    100: "#ffe0c2",
    200: "#ffc994",
    300: "#ffad5c",
    400: "#f8943a",
    500: "#f07e1c",
    600: "#d36510",
    700: "#b24e0b",
    800: "#8f3c07",
    900: "#6b2b03",
  },
  green: {
    50: "#ecffe9",
    100: "#c9ffc2",
    200: "#9dff93",
    300: "#6fff62",
    400: "#4dff3a",
    500: "#39ff14",
    600: "#19d600",
    700: "#12a300",
    800: "#0b7300",
    900: "#064800",
  },
  neutral: {
    background: {
      primary: "#f7f3ef",
      secondary: "#fff8f0",
      tertiary: "#efe7df",
    },
    text: {
      primary: "#2b2420",
      secondary: "#5c4f46",
      muted: "#7c6f65",
    },
    border: {
      strong: "#d8c4b2",
      soft: "#eadfd4",
    },
  },
  white: "#ffffff",
  black: "#000000",
} as const;

// ─── Spacing Tokens ──────────────────────────────────────────

export const spacing = {
  "space-1": "4px",
  "space-2": "8px",
  "space-3": "12px",
  "space-4": "16px",
  "space-5": "24px",
  "space-6": "32px",
  "space-7": "48px",
  "space-8": "64px",
} as const;

// ─── Border Radius ───────────────────────────────────────────

export const radius = {
  sm: "6px",
  md: "12px",
} as const;

// ─── Shadows ─────────────────────────────────────────────────

export const shadows = {
  soft: "0 2px 8px rgba(43, 36, 32, 0.08)",
} as const;

// ─── Typography ──────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },
  fontSize: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
} as const;

// ─── Aggregated Theme Object ─────────────────────────────────

export const tokens = {
  colors,
  spacing,
  radius,
  shadows,
  typography,
} as const;

export type Tokens = typeof tokens;
