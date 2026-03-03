/**
 * Typography — Text rendering primitive
 */
import React from "react";
import type { TypographyVariant } from "@snackro/types";

interface TypographyProps {
  variant?: TypographyVariant;
  children: React.ReactNode;
  color?: string;
  align?: React.CSSProperties["textAlign"];
  style?: React.CSSProperties;
}

const variantMap: Record<
  TypographyVariant,
  { tag: keyof React.JSX.IntrinsicElements; styles: React.CSSProperties }
> = {
  h1: {
    tag: "h1",
    styles: {
      fontSize: "var(--font-size-4xl)",
      fontWeight: "var(--font-weight-bold)" as unknown as number,
      lineHeight: "var(--line-height-tight)",
    },
  },
  h2: {
    tag: "h2",
    styles: {
      fontSize: "var(--font-size-3xl)",
      fontWeight: "var(--font-weight-bold)" as unknown as number,
      lineHeight: "var(--line-height-tight)",
    },
  },
  h3: {
    tag: "h3",
    styles: {
      fontSize: "var(--font-size-2xl)",
      fontWeight: "var(--font-weight-semibold)" as unknown as number,
      lineHeight: "var(--line-height-tight)",
    },
  },
  h4: {
    tag: "h4",
    styles: {
      fontSize: "var(--font-size-xl)",
      fontWeight: "var(--font-weight-semibold)" as unknown as number,
      lineHeight: "var(--line-height-normal)",
    },
  },
  body: {
    tag: "p",
    styles: {
      fontSize: "var(--font-size-base)",
      fontWeight: "var(--font-weight-normal)" as unknown as number,
      lineHeight: "var(--line-height-normal)",
    },
  },
  caption: {
    tag: "span",
    styles: {
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-normal)" as unknown as number,
      lineHeight: "var(--line-height-normal)",
      color: "var(--color-text-muted)",
    },
  },
  label: {
    tag: "label",
    styles: {
      fontSize: "var(--font-size-sm)",
      fontWeight: "var(--font-weight-medium)" as unknown as number,
      lineHeight: "var(--line-height-normal)",
      color: "var(--color-text-secondary)",
    },
  },
};

export const Typography: React.FC<TypographyProps> = ({
  variant = "body",
  children,
  color,
  align,
  style,
}) => {
  const { tag: Tag, styles: variantStyle } = variantMap[variant];

  return (
    <Tag
      style={{
        ...variantStyle,
        color: color ?? variantStyle.color ?? "inherit",
        textAlign: align,
        fontFamily: "var(--font-sans)",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
};
