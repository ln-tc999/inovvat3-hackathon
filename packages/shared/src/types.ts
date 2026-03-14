export type ActionType = "SUPPLY" | "WITHDRAW" | "REBALANCE";

export interface YieldAction {
  protocol: `0x${string}`;
  action: ActionType;
  asset: `0x${string}`;
  amount: bigint; // 0 = "all"
}

export interface LLMDecision {
  actions: {
    protocol: string;
    action: string;
    asset: string;
    amount: string;
  }[];
  reason: string;
}

export interface UserPolicy {
  maxRisk: number;
  dailyLimit: bigint;
  sessionExpiry: bigint;
  instructionHash: `0x${string}`;
  active: boolean;
}

export interface PoolData {
  protocol: string;
  asset: string;
  apy: number;       // basis points
  riskScore: number; // 1-10
  tvl: bigint;
}

export interface Portfolio {
  user: `0x${string}`;
  balances: { asset: string; protocol: string; amount: bigint }[];
  totalValueUSD: number;
  currentAPY: number;
}

export interface AgentStatus {
  active: boolean;
  lastExecution: number;
  nextExecution: number;
  profitToday: number;
  totalProfit: number;
}

// Chain config
export interface ChainConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  contracts: {
    agentPolicy: `0x${string}`;
    yieldOptimizerCore: `0x${string}`;
    safeAgentModule: `0x${string}`;
    autoYieldConsumer: `0x${string}`;
    aaveAdapter: `0x${string}`;
    morphoAdapter: `0x${string}`;
  };
  tokens: {
    USDC: `0x${string}`;
    USDT?: `0x${string}`;
    DAI?: `0x${string}`;
  };
}
