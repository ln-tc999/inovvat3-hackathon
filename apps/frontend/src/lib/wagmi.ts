import { createConfig, http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { injected, coinbaseWallet, walletConnect } from "@wagmi/connectors";

export const wagmiConfig = createConfig({
  chains: [baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({ appName: "DeFAI YieldGuard" }),
  ],
  transports: {
    [baseSepolia.id]: http("https://sepolia.base.org"),
  },
});
