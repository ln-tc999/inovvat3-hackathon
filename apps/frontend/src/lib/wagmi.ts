import { createConfig, http } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet } from "@wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia, base],
  connectors: [
    injected({ target: "metaMask" }),
    coinbaseWallet({ appName: "DeFAI YieldGuard" }),
    injected(), // generic injected (Rabby, etc.)
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
    [base.id]: http("https://mainnet.base.org"),
  },
});

export const SUPPORTED_CHAIN = baseSepolia; // switch to base for mainnet
