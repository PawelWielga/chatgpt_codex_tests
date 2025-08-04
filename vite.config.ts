import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Use URL-based alias to avoid relying on Node globals/types in ESM
const srcPath = new URL("./src", import.meta.url).pathname;

// Determine base path for GitHub Pages deployments.
// Avoid Node types by reading from import.meta.env at build-time.
// The workflow sets VITE_BASE_PATH env which Vite exposes as import.meta.env.VITE_BASE_PATH.
const baseFromEnv = (import.meta as any).env?.VITE_BASE_PATH as string | undefined;
const base = baseFromEnv && baseFromEnv.trim().length > 0 ? baseFromEnv : "/";

export default defineConfig({
  plugins: [react()],
  base,
  resolve: {
    alias: {
      "@": srcPath,
    },
  },
});
