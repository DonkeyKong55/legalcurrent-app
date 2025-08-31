import { defineConfig } from "vite";
import { reactRouter } from "@react-router/dev/vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    reactRouter({
      // This is the correct way to disable the broken server-side step
      prerender: false,
    }),
    tsconfigPaths(),
  ],
});