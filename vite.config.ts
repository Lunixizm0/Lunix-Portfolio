/// <reference types="vitest" />
/// <reference types="vite/client" />

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (
            id.includes("/react/") ||
            id.includes("react-dom") ||
            id.includes("/scheduler/") ||
            id.includes("/loose-envify/") ||
            id.includes("/object-assign/") ||
            id.includes("/js-tokens/")
          ) {
            return "vendor-react";
          }
          if (
            id.includes("styled-components") ||
            id.includes("/stylis") ||
            id.includes("/css-to-react-native/") ||
            id.includes("/inline-style-parser/")
          ) {
            return "vendor-styled";
          }
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
});