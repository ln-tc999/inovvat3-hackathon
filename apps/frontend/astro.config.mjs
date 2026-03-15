import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwind from "@astrojs/tailwind";
import vercel from "@astrojs/vercel";

export default defineConfig({
  integrations: [react(), tailwind()],
  output: "server",
  adapter: vercel(),
  vite: {
    define: { global: "globalThis" },
    resolve: { alias: { "@": "/src" } },
    optimizeDeps: {
      include: ["react", "react-dom", "wagmi", "viem", "recharts"],
    },
    ssr: {
      noExternal: [
        "@rainbow-me/rainbowkit",
        "@vanilla-extract/sprinkles",
        "@vanilla-extract/css",
        "@vanilla-extract/dynamic",
        "wagmi",
        "viem",
      ],
    },
  },
});
