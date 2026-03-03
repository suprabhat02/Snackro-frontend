/**
 * Stack — Flexbox layout primitive
 */
import React from "react";

interface StackProps {
  children: React.ReactNode;
  direction?: "row" | "column";
  gap?: string;
  align?: React.CSSProperties["alignItems"];
  justify?: React.CSSProperties["justifyContent"];
  wrap?: boolean;
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = "column",
  gap = "var(--space-3)",
  align = "stretch",
  justify = "flex-start",
  wrap = false,
  style,
}) => {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        gap,
        alignItems: align,
        justifyContent: justify,
        flexWrap: wrap ? "wrap" : "nowrap",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
