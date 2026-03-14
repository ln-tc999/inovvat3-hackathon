import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { base, baseSepolia } from "wagmi/chains";
import { http } from "wagmi";

export const wagmiConfig = getDefaultConfig({
  appName: "DeFAI YieldGuard",
  // WalletConnect project ID — get free one at https://cloud.walletconnect.com
  // For hackathon/local dev a placeholder still enables injected wallets
  projectId: import.meta.env.PUBLIC_WALLETCONNECT_PROJECT_ID ?? "placeholder",
  chains: [baseSepolia, base],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
  ssr: false, // Astro islands are client-only
});

export const SUPPORTED_CHAIN = baseSepolia;
