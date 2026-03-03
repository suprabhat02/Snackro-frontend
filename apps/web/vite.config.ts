import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@snackro/types": path.resolve(__dirname, "../../packages/types/src"),
      "@snackro/config": path.resolve(__dirname, "../../packages/config/src"),
      "@snackro/utils": path.resolve(__dirname, "../../packages/utils/src"),
      "@snackro/api": path.resolve(__dirname, "../../packages/api/src"),
      "@snackro/auth-core": path.resolve(
        __dirname,
        "../../packages/auth-core/src",
      ),
      "@snackro/store": path.resolve(__dirname, "../../packages/store/src"),
      "@snackro/features": path.resolve(
        __dirname,
        "../../packages/features/src",
      ),
      "@snackro/ui": path.resolve(__dirname, "../../packages/ui/src"),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
  },
  // Load env from monorepo root
  envDir: "../../",
});
