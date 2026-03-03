import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.{test,spec}.{ts,tsx}"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["packages/*/src/**/*.{ts,tsx}", "apps/web/src/**/*.{ts,tsx}"],
      exclude: [
        "**/*.d.ts",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/index.ts",
      ],
    },
  },
  resolve: {
    alias: {
      "@snackro/types": path.resolve(__dirname, "packages/types/src"),
      "@snackro/config": path.resolve(__dirname, "packages/config/src"),
      "@snackro/utils": path.resolve(__dirname, "packages/utils/src"),
      "@snackro/api": path.resolve(__dirname, "packages/api/src"),
      "@snackro/auth-core": path.resolve(__dirname, "packages/auth-core/src"),
      "@snackro/store": path.resolve(__dirname, "packages/store/src"),
      "@snackro/features": path.resolve(__dirname, "packages/features/src"),
      "@snackro/ui": path.resolve(__dirname, "packages/ui/src"),
    },
  },
});
