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
        // Split heavy/stable vendors into their own cacheable chunks.
        // Function form is supported by both Rollup and Rolldown.
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("recharts") || id.includes("/d3-")) return "charts";
          if (id.includes("react-router") || id.includes("/react-dom/") || id.includes("/react/")) {
            return "react";
          }
          if (id.includes("@tanstack") || id.includes("/axios/")) return "query";
          return "vendor";
        },
      },
    },
  },
});
