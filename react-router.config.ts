import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,    // disable server rendering
  prerender: false, // disable prerender step
} satisfies Config;
