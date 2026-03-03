/**
 * Card — Pure presentation component
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
        border: "1px solid var(--color-border-soft)",
        boxShadow: "var(--shadow-soft)",
        padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
