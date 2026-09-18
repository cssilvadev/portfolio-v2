import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/portfolio-v2/",
  build: {
    // The interactive Spline runtime is intentionally isolated and lazy-loaded;
    // its large chunks should not make the landing bundle warning noisy.
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          icons: ["react-icons"],
          spline: ["@splinetool/react-spline", "@splinetool/runtime"],
        },
      },
    },
  },
});
