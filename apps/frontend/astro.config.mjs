import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import node from "@astrojs/node";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: node({ mode: "standalone" }),
  vite: {
    define: { global: "globalThis" },
    resolve: { alias: { "@": "/src" } },
    optimizeDeps: {
      include: ["react", "react-dom", "wagmi", "viem", "recharts"],
    },
  },
});
