// Typed Hono RPC client — no manual fetch needed in islands
// Uses hono/client for end-to-end type safety

const BASE_URL =
  typeof window !== "undefined"
    ? (import.meta.env.PUBLIC_API_URL ?? "")
    : "";

// Lightweight typed wrappers (hc requires bundling the full app type,
// so we use simple typed fetch helpers that match the Hono routes exactly)

export interface SetInstructionResponse {
  success: boolean;
  agentId: string;
  preview: string;
  suggestedAPY: number;
  riskScore: number;
}

export interface AgentStatusResponse {
  active: boolean;
  agentId: string;
  lastAction: string;
  lastActionAt: number;
  currentAPY: number;
  instruction: string;
  totalProfitUSD: number;
  portfolio: PortfolioPosition[];
}

export interface PortfolioPosition {
  asset: string;
  symbol: string;
  amount: number;
  amountUSD: number;
  apy: number;
  protocol: "Aave" | "Morpho";
  yieldEarnedToday: number;
}

export interface MockUpkeepResponse {
  actions: { protocol: string; action: string; asset: string; amount: number }[];
  reason: string;
  newPortfolio: PortfolioPosition[];
  newAPY: number;
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json() as Promise<T>;
}

export interface GenerateProfileRequest {
  riskTier:        "conservative" | "moderate" | "aggressive";
  preferredAssets: string[];
  timeHorizon:     "short" | "medium" | "long";
  yieldTarget:     number;
  walletAddress?:  string;
}

export interface GenerateProfileResponse {
  agentName:            string;
  agentPersonality:     string;
  generatedInstruction: string;
  maxRisk:              number;
  dailyLimitUSD:        number;
  suggestedAPY:         number;
  reasoning:            string;
}

export interface DepositWithdrawRequest {
  userAddress: string;
  asset: "USDC" | "WETH";
  amount: number;
  protocol?: "aave" | "morpho";
}

export interface DepositWithdrawResponse {
  success: boolean;
  txHash: string;
  asset: string;
  amount: number;
  protocol: string;
}

export const apiClient = {
  setInstruction: (body: { instruction: string; maxRisk?: number; userAddress?: string }) =>
    apiFetch<SetInstructionResponse>("/agent/set-instruction", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  getStatus: () => apiFetch<AgentStatusResponse>("/agent/status"),

  pause: (active: boolean) =>
    apiFetch<{ success: boolean; active: boolean }>("/agent/pause", {
      method: "POST",
      body: JSON.stringify({ active }),
    }),

  mockUpkeep: () =>
    apiFetch<MockUpkeepResponse>("/agent/mock-upkeep", { method: "POST" }),

  generateProfile: (body: GenerateProfileRequest) =>
    apiFetch<GenerateProfileResponse>("/agent/generate-profile", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  deposit: (body: DepositWithdrawRequest) =>
    apiFetch<DepositWithdrawResponse>("/agent/deposit", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  withdraw: (body: DepositWithdrawRequest) =>
    apiFetch<DepositWithdrawResponse>("/agent/withdraw", {
      method: "POST",
      body: JSON.stringify(body),
    }),
};
