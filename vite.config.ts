import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    // Port 5173 is whitelisted by the backend CORS config (SecurityConfig.java).
    port: 5173,
    strictPort: false,
  },
  build: {
    rollupOptions: {
      output: {
        // Split the heavy charting lib into its own cacheable chunk; keep the rest
        // of node_modules in one "vendor" chunk to avoid cross-chunk circular deps
        // (react ⇄ react-query ⇄ router all reference each other).
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("/d3-") || id.includes("victory")) {
            return "charts";
          }
          return "vendor";
        },
      },
    },
  },
});
