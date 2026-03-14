import { WagmiProvider as WagmiProviderBase } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider, darkTheme, lightTheme } from "@rainbow-me/rainbowkit";
import { wagmiConfig } from "../lib/wagmi";
import type { ReactNode } from "react";

// Import RainbowKit styles — loaded once, tree-shaken in prod
import "@rainbow-me/rainbowkit/styles.css";

// Singleton — shared across all islands via module cache
const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 10_000, retry: 1 } },
});

// Custom RainbowKit theme matching our CSS variables
const rkDarkTheme = darkTheme({
  accentColor: "#ff4800",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "none",
});

const rkLightTheme = lightTheme({
  accentColor: "#ff4800",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "none",
});

interface Props {
  children: ReactNode;
  isDark?: boolean;
}

export function WagmiProvider({ children, isDark = true }: Props) {
  return (
    <WagmiProviderBase config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={isDark ? rkDarkTheme : rkLightTheme}>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProviderBase>
  );
}
