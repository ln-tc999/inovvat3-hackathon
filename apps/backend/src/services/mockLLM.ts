// Mock for hackathon - no real Chainlink Functions or LLM API called here
// Simulates the JS source that would run inside the Chainlink DON

import type { LLMDecision, YieldAction } from "../types.js";

interface PoolInfo {
  protocol: "Aave" | "Morpho";
  asset: string;
  apy: number; // basis points
  riskScore: number;
}

const POOLS: PoolInfo[] = [
  { protocol: "Aave",   asset: "USDC", apy: 450,  riskScore: 2 },
  { protocol: "Morpho", asset: "USDC", apy: 680,  riskScore: 3 },
  { protocol: "Aave",   asset: "DAI",  apy: 390,  riskScore: 2 },
  { protocol: "Morpho", asset: "DAI",  apy: 590,  riskScore: 3 },
  { protocol: "Aave",   asset: "USDT", apy: 420,  riskScore: 2 },
];

function parseInstruction(instruction: string): {
  preferLowRisk: boolean;
  stablecoinsOnly: boolean;
  maxRisk: number;
  preferMorpho: boolean;
  compoundFrequency: string;
} {
  const lower = instruction.toLowerCase();
  return {
    preferLowRisk:    /low.?risk|safe|conservative|preserve/.test(lower),
    stablecoinsOnly:  /stable|usdc|dai|usdt/.test(lower),
    maxRisk:          /aggressive|degen|high.?risk/.test(lower) ? 8 : /moderate/.test(lower) ? 5 : 3,
    preferMorpho:     /morpho/.test(lower),
    compoundFrequency: /weekly/.test(lower) ? "weekly" : /daily/.test(lower) ? "daily" : "6h",
  };
}

export function mockLLMDecision(
  instruction: string,
  currentAsset: string = "USDC",
  currentProtocol: "Aave" | "Morpho" = "Aave",
  currentAmount: number = 1000e6
): LLMDecision {
  const parsed = parseInstruction(instruction);

  // Filter pools by risk preference
  const eligible = POOLS.filter((p) => {
    if (parsed.stablecoinsOnly && !["USDC", "DAI", "USDT"].includes(p.asset)) return false;
    if (parsed.preferLowRisk && p.riskScore > parsed.maxRisk) return false;
    return true;
  });

  // Pick best APY pool
  const best = eligible.sort((a, b) => b.apy - a.apy)[0] ?? POOLS[0];

  const actions: YieldAction[] = [];

  // Only act if better APY found (>50bps improvement)
  if (best.protocol !== currentProtocol || best.asset !== currentAsset) {
    actions.push({
      protocol: currentProtocol,
      action: "withdraw",
      asset: currentAsset,
      amount: currentAmount,
    });
    actions.push({
      protocol: best.protocol,
      action: "supply",
      asset: best.asset,
      amount: currentAmount,
    });
  }

  const reason =
    actions.length > 0
      ? `Switched to ${best.protocol} ${best.asset} @ ${(best.apy / 100).toFixed(1)}% APY for better yield`
      : `Staying in ${currentProtocol} ${currentAsset} — already optimal`;

  return {
    actions,
    reason,
    suggestedAPY: best.apy,
    riskScore: best.riskScore,
  };
}
