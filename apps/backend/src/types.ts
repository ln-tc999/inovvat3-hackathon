import type { Hono } from "hono";

// ── Shared types ──────────────────────────────────────────────────────────────

export interface YieldAction {
  protocol: "Aave" | "Morpho";
  action: "supply" | "withdraw";
  asset: string;
  amount: number; // in token base units (e.g. 100e6 for 100 USDC)
}

export interface LLMDecision {
  actions: YieldAction[];
  reason: string;
  suggestedAPY: number; // basis points
  riskScore: number;    // 1-10
}

export interface PortfolioPosition {
  asset: string;
  symbol: string;
  amount: number;       // human-readable (e.g. 1000.00)
  amountUSD: number;
  apy: number;          // basis points
  protocol: "Aave" | "Morpho";
  yieldEarnedToday: number; // USD
}

export interface AgentStatus {
  active: boolean;
  agentId: string;
  lastAction: string;
  lastActionAt: number; // unix ms
  currentAPY: number;   // basis points
  instruction: string;
  totalProfitUSD: number;
  portfolio: PortfolioPosition[];
}

export interface SetInstructionBody {
  instruction: string;
  maxRisk?: number;
  userAddress?: string;
}

export interface MockUpkeepResult {
  actions: YieldAction[];
  reason: string;
  newPortfolio: PortfolioPosition[];
  newAPY: number;
}

// Async version for DashScope
export type MockUpkeepResultAsync = Promise<MockUpkeepResult>;

// Hono App type — exported for hc<App> typed RPC on frontend
export type AppType = Hono;
