/**
 * Container — Centered max-width wrapper
 */
import React from "react";

interface ContainerProps {
  children: React.ReactNode;
  maxWidth?: string;
  style?: React.CSSProperties;
}

export const Container: React.FC<ContainerProps> = ({
  children,
  maxWidth = "1200px",
  style,
}) => {
  return (
    <div
      style={{
        width: "100%",
        maxWidth,
        marginLeft: "auto",
        marginRight: "auto",
        paddingLeft: "var(--space-4)",
        paddingRight: "var(--space-4)",
        ...style,
      }}
    >
      {children}
    </div>
  );
};
