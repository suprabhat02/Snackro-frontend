/**
 * ThemeToggle — three-way pill toggle: Light | System | Dark
 *
 * Reads / writes via useTheme() context.
 */
import { Sun, Monitor, Moon } from "react-feather";
import { useTheme, type ThemeMode } from "../contexts/ThemeContext";

interface ToggleOption {
  mode: ThemeMode;
  Icon: React.FC<
    React.SVGProps<SVGSVGElement> & {
      size?: number | string;
      strokeWidth?: number | string;
    }
  >;
  label: string;
}

const OPTIONS: ToggleOption[] = [
  { mode: "light", Icon: Sun, label: "Light theme" },
  { mode: "system", Icon: Monitor, label: "Follow system" },
  { mode: "dark", Icon: Moon, label: "Dark theme" },
];

export function ThemeToggle() {
  const { mode, setMode } = useTheme();

  return (
    <div
      role="group"
      aria-label="Theme preference"
      style={{
        display: "inline-flex",
        borderRadius: "var(--radius-sm)",
        border: "1px solid var(--color-border-strong)",
        overflow: "hidden",
        backgroundColor: "var(--color-bg-tertiary)",
      }}
    >
      {OPTIONS.map(({ mode: m, Icon, label }) => {
        const active = mode === m;
        return (
          <button
            key={m}
            type="button"
            title={label}
            aria-label={label}
            aria-pressed={active}
            onClick={() => setMode(m)}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "5px 9px",
              border: "none",
              cursor: "pointer",
              lineHeight: 0,
              transition: "background-color 0.15s, color 0.15s",
              backgroundColor: active
                ? "var(--color-orange-500)"
                : "transparent",
              color: active ? "#fff" : "var(--color-text-muted)",
            }}
          >
            <Icon size={13} strokeWidth={2.25} />
          </button>
        );
      })}
    </div>
  );
}
