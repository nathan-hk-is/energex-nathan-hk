import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig({
  resolve: {
    // Don't let esbuild bundle a second copy
    dedupe: ["react", "react-dom"],

    // Point every import-path at the *one* real copy
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
    },
  },
    server: {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false
          },
        },
      },
});
