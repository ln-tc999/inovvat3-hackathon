// Mock for hackathon - simulates on-chain portfolio state
import type { PortfolioPosition, MockUpkeepResult } from "../types.js";
import { dashscopeLLMDecision } from "./dashscopeLLM.js";

// Default mock portfolio
export const DEFAULT_PORTFOLIO: PortfolioPosition[] = [
  {
    asset: "USD Coin",
    symbol: "USDC",
    amount: 1000,
    amountUSD: 1000,
    apy: 450,
    protocol: "Aave",
    yieldEarnedToday: 0.12,
  },
  {
    asset: "Dai Stablecoin",
    symbol: "DAI",
    amount: 500,
    amountUSD: 500,
    apy: 390,
    protocol: "Aave",
    yieldEarnedToday: 0.05,
  },
];

export function calculateDailyYield(amountUSD: number, apyBps: number): number {
  return (amountUSD * (apyBps / 10000)) / 365;
}

export async function runMockUpkeep(
  instruction: string,
  currentPortfolio: PortfolioPosition[]
): Promise<MockUpkeepResult> {
  const largest = [...currentPortfolio].sort((a, b) => b.amountUSD - a.amountUSD)[0];

  const decision = await dashscopeLLMDecision(
    instruction,
    largest?.symbol ?? "USDC",
    largest?.protocol ?? "Aave",
    (largest?.amount ?? 1000) * 1e6,
    currentPortfolio  // full portfolio context
  );

  // Apply actions to portfolio (mock)
  let newPortfolio = currentPortfolio.map((pos) => ({ ...pos }));

  if (decision.actions.length > 0) {
    const withdrawAction = decision.actions.find((a) => a.action === "withdraw");
    const supplyAction   = decision.actions.find((a) => a.action === "supply");

    if (withdrawAction && supplyAction) {
      newPortfolio = newPortfolio.map((pos) => {
        if (pos.symbol === withdrawAction.asset && pos.protocol === withdrawAction.protocol) {
          return {
            ...pos,
            protocol: supplyAction.protocol,
            symbol: supplyAction.asset,
            apy: decision.suggestedAPY,
            yieldEarnedToday: calculateDailyYield(pos.amountUSD, decision.suggestedAPY),
          };
        }
        return pos;
      });
    }
  }

  return {
    actions: decision.actions,
    reason: decision.reason,
    newPortfolio,
    newAPY: decision.suggestedAPY,
  };
}
