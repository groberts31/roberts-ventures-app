import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig(({ mode }) => {
  const isAnalyze = mode === "analyze";

  return {
    plugins: [
      react(),

      // Pre-compress output assets (your host must be configured to serve .br/.gz)
      compression({
        algorithm: "brotliCompress",
        ext: ".br",
        threshold: 1024,
      }),
      compression({
        algorithm: "gzip",
        ext: ".gz",
        threshold: 1024,
      }),

      // Bundle report: dist/stats.html
      isAnalyze &&
        visualizer({
          filename: "dist/stats.html",
          open: true,
          gzipSize: true,
          brotliSize: true,
        }),
    ].filter(Boolean),

    build: {
      sourcemap: false,
      rollupOptions: {
        output: {
          // Keep heavy libs separated for better caching and faster initial load
          manualChunks(id: string) {
            if (!id.includes("node_modules")) return;

            if (id.includes("/three")) return "three";
            if (id.includes("/firebase")) return "firebase";

            // react stack
            if (id.includes("/react") || id.includes("/react-dom") || id.includes("/react-router")) {
              return "react-vendor";
            }

            return "vendor";
          },
        },
      },
    },
  };
});
