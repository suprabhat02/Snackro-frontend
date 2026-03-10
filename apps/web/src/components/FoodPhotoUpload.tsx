/**
 * FoodPhotoUpload — drag-and-drop meal photo uploader
 *
 * Flow: idle → drag-active → preview
 * Built on react-dropzone; images only, 10 MB max.
 * Backend integration wired in via onPhotoReady callback.
 */
import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Camera,
  UploadCloud,
  X,
  CheckCircle,
  AlertCircle,
} from "react-feather";
import { Card, Stack, Typography, Button } from "@snackro/ui";

// ─── Types ────────────────────────────────────────────────────

interface UploadedFile {
  file: File;
  preview: string;
  sizeLabel: string;
}

interface FoodPhotoUploadProps {
  /** Called when the user confirms the photo. Passes the raw File. */
  onPhotoReady?: (file: File) => void;
}

// ─── Helpers ──────────────────────────────────────────────────

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Animation variants ───────────────────────────────────────

const swapVariants = {
  enter: { opacity: 0, scale: 0.97 },
  center: {
    opacity: 1,
    scale: 1,
    transition: { type: "spring" as const, stiffness: 300, damping: 26 },
  },
  exit: {
    opacity: 0,
    scale: 0.97,
    transition: { duration: 0.14 },
  },
};

// ─── Component ────────────────────────────────────────────────

export function FoodPhotoUpload({ onPhotoReady }: FoodPhotoUploadProps) {
  const shouldReduce = useReducedMotion();
  const [uploaded, setUploaded] = useState<UploadedFile | null>(null);
  const [dropError, setDropError] = useState<string | null>(null);

  const onDrop = useCallback(
    (accepted: File[], rejected: import("react-dropzone").FileRejection[]) => {
      setDropError(null);

      if (rejected.length > 0) {
        const first = rejected[0].errors[0];
        if (first.code === "file-too-large") {
          setDropError("File is too large. Maximum size is 10 MB.");
        } else if (first.code === "file-invalid-type") {
          setDropError("Only image files (JPG, PNG, WEBP) are supported.");
        } else {
          setDropError("Could not read this file. Please try another.");
        }
        return;
      }

      if (accepted.length === 0) return;

      const file = accepted[0];
      if (uploaded?.preview) URL.revokeObjectURL(uploaded.preview);

      setUploaded({
        file,
        preview: URL.createObjectURL(file),
        sizeLabel: formatSize(file.size),
      });
    },
    [uploaded],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
    noClick: uploaded !== null,
    noDrag: uploaded !== null,
  });

  function handleReset() {
    if (uploaded?.preview) URL.revokeObjectURL(uploaded.preview);
    setUploaded(null);
    setDropError(null);
  }

  function handleSend() {
    if (uploaded) onPhotoReady?.(uploaded.file);
  }

  return (
    <div style={{ width: "100%" }}>
      <Stack gap="var(--space-4)">
        {/* ── Section heading ── */}
        <Stack direction="row" align="center" gap="var(--space-3)">
          <Camera
            size={18}
            strokeWidth={2}
            color="var(--color-text-secondary)"
          />
          <Typography variant="h4">Scan Your Meal</Typography>
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              letterSpacing: "0.07em",
              padding: "2px 8px",
              borderRadius: 9999,
              backgroundColor: "#ffedd5",
              color: "#ea580c",
              fontFamily: "var(--font-sans)",
              border: "1px solid #fed7aa",
            }}
          >
            COMING SOON
          </span>
        </Stack>

        <Typography variant="caption" color="var(--color-text-secondary)">
          Upload a photo of your meal — nutritional analysis will be calculated
          automatically once the backend integration is ready.
        </Typography>

        {/* ── Drop zone / Preview area ── */}
        <AnimatePresence mode="wait">
          {uploaded === null ? (
            /* ── Idle / drag-active state ── */
            <motion.div
              key="dropzone"
              variants={shouldReduce ? {} : swapVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <div
                {...getRootProps()}
                style={{
                  borderRadius: "var(--radius-lg)",
                  border: `2px dashed ${isDragActive ? "var(--color-orange-500)" : "var(--color-border-strong)"}`,
                  backgroundColor: isDragActive
                    ? "var(--color-orange-50)"
                    : "var(--color-bg-secondary)",
                  padding: "var(--space-7) var(--space-5)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "var(--space-4)",
                  transition: "border-color 0.18s, background-color 0.18s",
                  outline: "none",
                  userSelect: "none",
                }}
              >
                <input {...getInputProps()} />

                {/* Upload icon ring */}
                <motion.div
                  animate={
                    isDragActive && !shouldReduce
                      ? { scale: 1.12, rotate: -6 }
                      : { scale: 1, rotate: 0 }
                  }
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: "50%",
                    backgroundColor: isDragActive
                      ? "var(--color-orange-100)"
                      : "var(--color-bg-tertiary)",
                    border: `1px solid ${isDragActive ? "var(--color-orange-300)" : "var(--color-border-strong)"}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "background-color 0.18s, border-color 0.18s",
                  }}
                >
                  <UploadCloud
                    size={28}
                    strokeWidth={1.5}
                    color={
                      isDragActive
                        ? "var(--color-orange-600)"
                        : "var(--color-text-muted)"
                    }
                  />
                </motion.div>

                <Stack gap="var(--space-1)" style={{ textAlign: "center" }}>
                  <Typography
                    variant="label"
                    style={{
                      color: isDragActive
                        ? "var(--color-orange-700)"
                        : "var(--color-text-primary)",
                    }}
                  >
                    {isDragActive
                      ? "Drop to upload your meal photo"
                      : "Drop a photo here, or click to browse"}
                  </Typography>
                  <Typography variant="caption" color="var(--color-text-muted)">
                    JPG, PNG or WEBP · Up to 10 MB
                  </Typography>
                </Stack>
              </div>
            </motion.div>
          ) : (
            /* ── Preview state ── */
            <motion.div
              key="preview"
              variants={shouldReduce ? {} : swapVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              <Card
                padding="var(--space-4)"
                style={{ borderRadius: "var(--radius-lg)", overflow: "hidden" }}
              >
                <Stack gap="var(--space-4)">
                  {/* Image + meta row */}
                  <div
                    style={{
                      display: "flex",
                      gap: "var(--space-4)",
                      alignItems: "flex-start",
                    }}
                  >
                    {/* Thumbnail */}
                    <div
                      style={{
                        flexShrink: 0,
                        width: 96,
                        height: 96,
                        borderRadius: "var(--radius-md)",
                        overflow: "hidden",
                        border: "1px solid var(--color-border-strong)",
                        backgroundColor: "var(--color-bg-tertiary)",
                      }}
                    >
                      <img
                        src={uploaded.preview}
                        alt="Meal preview"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          display: "block",
                        }}
                      />
                    </div>

                    {/* File info */}
                    <Stack
                      gap="var(--space-2)"
                      style={{ flex: 1, minWidth: 0 }}
                    >
                      <Stack
                        direction="row"
                        align="center"
                        gap="var(--space-2)"
                      >
                        <CheckCircle
                          size={14}
                          strokeWidth={2.5}
                          color="var(--color-success)"
                        />
                        <Typography
                          variant="label"
                          style={{ color: "var(--color-success)" }}
                        >
                          Photo ready
                        </Typography>
                      </Stack>

                      <Typography
                        variant="body"
                        style={{
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          maxWidth: "100%",
                        }}
                      >
                        {uploaded.file.name}
                      </Typography>

                      <Typography
                        variant="caption"
                        color="var(--color-text-muted)"
                      >
                        {uploaded.sizeLabel}
                      </Typography>

                      <button
                        onClick={handleReset}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          fontSize: "var(--font-size-xs)",
                          color: "var(--color-text-muted)",
                          cursor: "pointer",
                          background: "none",
                          border: "none",
                          padding: 0,
                          fontFamily: "var(--font-sans)",
                          marginTop: 2,
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.color = "var(--color-danger)")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.color =
                            "var(--color-text-muted)")
                        }
                      >
                        <X size={12} strokeWidth={2.5} />
                        Remove photo
                      </button>
                    </Stack>
                  </div>

                  {/* Send button */}
                  <Button
                    variant="primary"
                    size="md"
                    style={{ width: "100%" }}
                    onClick={handleSend}
                  >
                    <Stack
                      direction="row"
                      align="center"
                      justify="center"
                      gap="var(--space-2)"
                    >
                      <Camera size={15} strokeWidth={2} />
                      <span>Send Meal Photo</span>
                    </Stack>
                  </Button>
                </Stack>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Drop error banner ── */}
        <AnimatePresence>
          {dropError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.18 }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-2)",
                padding: "var(--space-3) var(--space-4)",
                borderRadius: "var(--radius-md)",
                backgroundColor: "var(--color-error-bg)",
                border: "1px solid var(--color-error-border)",
              }}
            >
              <AlertCircle
                size={14}
                strokeWidth={2.5}
                color="var(--color-error-text)"
              />
              <Typography
                variant="caption"
                style={{ color: "var(--color-error-text)" }}
              >
                {dropError}
              </Typography>
            </motion.div>
          )}
        </AnimatePresence>
      </Stack>
    </div>
  );
}
