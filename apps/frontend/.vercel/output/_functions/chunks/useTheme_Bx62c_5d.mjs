import { jsx } from 'react/jsx-runtime';
import { http, WagmiProvider as WagmiProvider$1 } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { getDefaultConfig, darkTheme, lightTheme, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { baseSepolia, base } from 'wagmi/chains';
/* empty css                             */
import { useState, useEffect, useCallback } from 'react';

const wagmiConfig = getDefaultConfig({
  appName: "DeFAI YieldGuard",
  // WalletConnect project ID — get free one at https://cloud.walletconnect.com
  // For hackathon/local dev a placeholder still enables injected wallets
  projectId: "1d2a9be51e718bb034394252ed405567",
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org")
  },
  ssr: false
  // Astro islands are client-only
});

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 1e4, retry: 1 } }
});
const rkDarkTheme = darkTheme({
  accentColor: "#ff4800",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "none"
});
const rkLightTheme = lightTheme({
  accentColor: "#ff4800",
  accentColorForeground: "#ffffff",
  borderRadius: "medium",
  fontStack: "system",
  overlayBlur: "none"
});
function WagmiProvider({ children, isDark = true }) {
  return /* @__PURE__ */ jsx(WagmiProvider$1, { config: wagmiConfig, children: /* @__PURE__ */ jsx(QueryClientProvider, { client: queryClient, children: /* @__PURE__ */ jsx(RainbowKitProvider, { theme: isDark ? rkDarkTheme : rkLightTheme, children }) }) });
}

function getInitialTheme() {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem("theme");
  if (saved === "light") return false;
  if (saved === "dark") return true;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function useTheme() {
  const [isDark, setIsDark] = useState(getInitialTheme);
  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem("theme", isDark ? "dark" : "light");
  }, [isDark]);
  const toggle = useCallback(() => setIsDark((v) => !v), []);
  return { isDark, toggle };
}

export { WagmiProvider as W, useTheme as u };
