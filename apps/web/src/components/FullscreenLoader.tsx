/**
 * FullscreenLoader — global loading overlay
 *
 * Usage:
 *   <FullscreenLoader />
 *   <FullscreenLoader label="Saving…" />
 *
 * Performance notes:
 *   • LoaderVector is lazy-loaded (React.lazy + Suspense) so its ~1 400-line
 *     SVG is code-split into a separate chunk and never bloats the main bundle.
 *   • The Suspense fallback is a single CSS-animated ring — zero JS overhead.
 *   • No framer-motion inside; the caller wraps with AnimatePresence if fades
 *     are needed (see LoginPage).
 */
import { lazy, Suspense } from "react";

// Code-split: vector SVG lands in its own async chunk (~separate HTTP request)
const LoaderVector = lazy(() => import("./LoaderVector"));

interface FullscreenLoaderProps {
  label?: string;
}

export function FullscreenLoader({
  label = "Loading....",
}: FullscreenLoaderProps) {
  return (
    <div
      role="status"
      aria-label={label}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        backgroundColor:
          "color-mix(in srgb, var(--color-bg-primary) 90%, transparent)",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* Animated illustration — fills the viewport, slightly faded so the
          logo overlay reads clearly on top */}
      <div
        aria-hidden="true"
        style={{ width: "min(90vw, 560px)", flexShrink: 0 }}
      >
        <Suspense fallback={<SpinnerRing />}>
          <LoaderVector />
        </Suspense>
      </div>
    </div>
  );
}

/** Minimal CSS ring shown while the SVG chunk is fetching (typically < 100 ms on localhost). */
function SpinnerRing() {
  return (
    <div
      style={{
        width: 36,
        height: 36,
        borderRadius: "50%",
        border: "3px solid var(--color-border-strong)",
        borderTopColor: "#f07e1c",
        animation: "snackro-spin 0.85s linear infinite",
      }}
    />
  );
}
