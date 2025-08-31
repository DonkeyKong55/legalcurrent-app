import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import path from "path";
import { fileURLToPath } from "url";

// This code helps find the correct path to your 'src' folder
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [
    reactRouter({
      prerender: false,
    }),
  ],
  // This section manually tells Vite what the "@" shortcut means
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
