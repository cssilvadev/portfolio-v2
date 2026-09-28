import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/portfolio-v2/",
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-dom/client", "react-router-dom"],
          supabase: ["@supabase/supabase-js"],
          icons: ["react-icons"],
        },
      },
    },
  },
});
