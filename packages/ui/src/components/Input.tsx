/**
 * Input — Pure presentation component
 */
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  fullWidth = false,
  id,
  style,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-1)",
        width: fullWidth ? "100%" : "auto",
      }}
    >
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: "var(--font-size-sm)",
            fontWeight: "var(--font-weight-medium)" as unknown as number,
            color: "var(--color-text-secondary)",
          }}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        style={{
          padding: "var(--space-2) var(--space-3)",
          borderRadius: "var(--radius-sm)",
          border: `1px solid ${error ? "var(--color-danger)" : "var(--color-border-soft)"}`,
          backgroundColor: "var(--color-bg-secondary)",
          color: "var(--color-text-primary)",
          fontSize: "var(--font-size-base)",
          fontFamily: "var(--font-sans)",
          outline: "none",
          transition: "border-color 0.2s ease",
          width: "100%",
          ...style,
        }}
        {...props}
      />
      {error && (
        <span
          style={{
            fontSize: "var(--font-size-xs)",
            color: "var(--color-danger)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
};
