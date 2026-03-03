/**
 * Button — Pure presentation component
 * NO Redux, NO API calls
 */
import React from "react";
import type { ButtonVariant, ButtonSize } from "@snackro/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    backgroundColor: "var(--color-primary)",
    color: "var(--color-bg-primary)",
    border: "none",
  },
  secondary: {
    backgroundColor: "transparent",
    color: "var(--color-primary)",
    border: "2px solid var(--color-primary)",
  },
  ghost: {
    backgroundColor: "transparent",
    color: "var(--color-text-secondary)",
    border: "none",
  },
  danger: {
    backgroundColor: "var(--color-danger)",
    color: "#ffffff",
    border: "none",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: {
    padding: "var(--space-1) var(--space-3)",
    fontSize: "var(--font-size-sm)",
  },
  md: {
    padding: "var(--space-2) var(--space-4)",
    fontSize: "var(--font-size-base)",
  },
  lg: {
    padding: "var(--space-3) var(--space-5)",
    fontSize: "var(--font-size-lg)",
  },
};

export const Button: React.FC<ButtonProps> = ({
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  children,
  disabled,
  style,
  ...props
}) => {
  return (
    <button
      disabled={disabled || loading}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--space-2)",
        borderRadius: "var(--radius-sm)",
        fontWeight: "var(--font-weight-semibold)" as unknown as number,
        cursor: disabled || loading ? "not-allowed" : "pointer",
        opacity: disabled || loading ? 0.6 : 1,
        transition: "all 0.2s ease",
        width: fullWidth ? "100%" : "auto",
        fontFamily: "var(--font-sans)",
        ...variantStyles[variant],
        ...sizeStyles[size],
        ...style,
      }}
      {...props}
    >
      {loading && (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
            display: "inline-block",
          }}
        />
      )}
      {children}
    </button>
  );
};
