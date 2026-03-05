/**
 * Card — Pure presentation component
 *
 * Uses a strong border for depth (Tailwind UI–style) rather than a heavy
 * box-shadow. The faint shadow-sm is kept only to give a 1-pixel "lift"
 * that reads naturally on both light and dark backgrounds.
 */
import React from "react";

interface CardProps {
  children: React.ReactNode;
  padding?: string;
  style?: React.CSSProperties;
}

export const Card: React.FC<CardProps> = ({
  children,
  padding = "var(--space-5)",
  style,
}) => {
  return (
    <div
      style={{
        backgroundColor: "var(--color-bg-secondary)",
        borderRadius: "var(--radius-md)",
        border: "1px solid var(--color-border-strong)",
        boxShadow: "var(--shadow-sm)",
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
