/**
 * SnackroLogo — renders snackro-logo.png from /assets/images/ with a
 * fallback letter-mark if the image has not yet been placed there.
 *
 * Place the logo at:
 *   apps/web/public/assets/images/snackro-logo.png
 * It will be served at /assets/images/snackro-logo.png in production.
 */
import { useState } from "react";
import { images } from "../assets/images";

interface SnackroLogoProps {
  size?: number;
  /** Additional inline styles applied to the outer wrapper */
  style?: React.CSSProperties;
}

export function SnackroLogo({ size = 40, style }: SnackroLogoProps) {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: "var(--radius-sm)",
          backgroundColor: "var(--color-orange-500)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          ...style,
        }}
      >
        <span
          style={{
            color: "#fff",
            fontWeight: 800,
            fontSize: size * 0.45,
            fontFamily: "var(--font-sans)",
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    );
  }

  return (
    <img
      src={images.snackroLogo}
      alt="SNACKRO"
      width={size}
      height={size}
      onError={() => setImgError(true)}
      style={{
        objectFit: "contain",
        borderRadius: "var(--radius-sm)",
        flexShrink: 0,
        display: "block",
        ...style,
      }}
    />
  );
}
