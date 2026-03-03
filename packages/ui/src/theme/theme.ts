/**
 * Theme — semantic aliases for design tokens
 */
import { tokens } from "./tokens";

export const theme = {
  colors: {
    primary: tokens.colors.orange[500],
    primaryHover: tokens.colors.orange[600],
    primaryActive: tokens.colors.orange[700],
    primaryLight: tokens.colors.orange[50],

    accent: tokens.colors.green[500],
    accentHover: tokens.colors.green[600],

    background: tokens.colors.neutral.background.primary,
    backgroundAlt: tokens.colors.neutral.background.secondary,
    surface: tokens.colors.neutral.background.tertiary,

    text: tokens.colors.neutral.text.primary,
    textSecondary: tokens.colors.neutral.text.secondary,
    textMuted: tokens.colors.neutral.text.muted,

    border: tokens.colors.neutral.border.strong,
    borderLight: tokens.colors.neutral.border.soft,

    white: tokens.colors.white,
    black: tokens.colors.black,

    danger: "#e53e3e",
    dangerHover: "#c53030",
    success: tokens.colors.green[600],
    warning: tokens.colors.orange[400],
  },
  spacing: tokens.spacing,
  radius: tokens.radius,
  shadows: tokens.shadows,
  typography: tokens.typography,
} as const;

export type Theme = typeof theme;
