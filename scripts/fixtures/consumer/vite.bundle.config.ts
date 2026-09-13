import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// check-bundle.mjs 用。利用側が一部だけを import したときに、使わない重い依存が
// 初期ロードに入らないかを sourcemap で調べる。
export default defineConfig({
  plugins: [react()],
  logLevel: "warn",
  build: {
    outDir: "dist-bundle",
    emptyOutDir: true,
    sourcemap: true,
    manifest: true,
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      input: {
        "nav-only": path.resolve(import.meta.dirname, "islands/nav-only.tsx"),
        "auto-mount-only": path.resolve(import.meta.dirname, "islands/auto-mount-only.tsx"),
      },
    },
  },
});
