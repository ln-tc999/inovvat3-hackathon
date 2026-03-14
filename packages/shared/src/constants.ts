import type { ChainConfig } from "./types";

export const BASE_SEPOLIA_CHAIN_ID = 84532;
export const BASE_MAINNET_CHAIN_ID = 8453;

// Placeholder — update after deployment
export const BASE_SEPOLIA_CONFIG: ChainConfig = {
  chainId: BASE_SEPOLIA_CHAIN_ID,
  name: "Base Sepolia",
  rpcUrl: "https://sepolia.base.org",
  contracts: {
    agentPolicy:          "0x0000000000000000000000000000000000000000",
    yieldOptimizerCore:   "0x0000000000000000000000000000000000000000",
    safeAgentModule:      "0x0000000000000000000000000000000000000000",
    autoYieldConsumer:    "0x0000000000000000000000000000000000000000",
    aaveAdapter:          "0x0000000000000000000000000000000000000000",
    morphoAdapter:        "0x0000000000000000000000000000000000000000",
  },
  tokens: {
    USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
  },
};

export const SUPPORTED_CHAINS: Record<number, ChainConfig> = {
  [BASE_SEPOLIA_CHAIN_ID]: BASE_SEPOLIA_CONFIG,
};

export const RISK_LABELS: Record<number, string> = {
  1: "Ultra Safe",
  3: "Conservative",
  5: "Moderate",
  7: "Aggressive",
  10: "Degen",
};

export const DEFAULT_SESSION_DURATION = 30 * 24 * 60 * 60; // 30 days in seconds
export const UPKEEP_INTERVAL = 6 * 60 * 60; // 6 hours
