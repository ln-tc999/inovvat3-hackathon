/**
 * DashScope (Alibaba Model Studio) — OpenAI-compatible endpoint
 * Model: qwen3-235b-a22b-thinking (largest enabled, extended CoT)
 */
import type { LLMDecision, PortfolioPosition } from "../types.js";
import { mockLLMDecision } from "./mockLLM.js";

const BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const MODEL    = "qwen3-235b-a22b"; // MoE 235B — best reasoning from enabled list

// ── Rich market context injected every call ───────────────────────────────────
const MARKET_CONTEXT = `
CURRENT DEFI MARKET (Base Sepolia testnet — simulated live data):
┌─────────────────────────────────────────────────────────────────┐
│ Protocol │ Asset │  APY   │ TVL      │ Risk │ Utilization       │
├─────────────────────────────────────────────────────────────────┤
│ Aave V3  │ USDC  │ 4.50%  │ $2.1B    │  2/10│ 78%              │
│ Aave V3  │ DAI   │ 3.90%  │ $890M    │  2/10│ 71%              │
│ Aave V3  │ USDT  │ 4.20%  │ $1.4B    │  2/10│ 75%              │
│ Morpho   │ USDC  │ 6.80%  │ $340M    │  3/10│ 91%              │
│ Morpho   │ DAI   │ 5.90%  │ $120M    │  3/10│ 85%              │
└─────────────────────────────────────────────────────────────────┘

RISK DEFINITIONS:
- Score 1-3: Conservative (battle-tested protocols, high liquidity)
- Score 4-6: Moderate (newer protocols, lower liquidity)
- Score 7-10: Aggressive (experimental, high IL risk)

REBALANCING COST: ~$0.50 gas on Base (negligible for >$500 positions)
MINIMUM APY IMPROVEMENT TO REBALANCE: 50 basis points (0.5%)
`;

const SYSTEM_PROMPT = `You are an elite autonomous DeFi yield optimization agent deployed on Base (Ethereum L2).
Your role: maximize risk-adjusted yield for users based on their explicit instructions and current market conditions.

${MARKET_CONTEXT}

DECISION FRAMEWORK:
1. Parse user intent: risk tolerance, preferred assets, time horizon, yield target
2. Evaluate current position vs all available opportunities
3. Calculate net benefit after gas costs
4. Only rebalance if improvement > 50bps AND aligns with user risk profile
5. Explain reasoning clearly — users trust you with real money

RESPONSE FORMAT — return ONLY valid JSON, no markdown fences, no text outside JSON:
{
  "actions": [
    {
      "protocol": "Aave" | "Morpho",
      "action": "withdraw" | "supply",
      "asset": "USDC" | "DAI" | "USDT",
      "amount": <integer in token base units, e.g. 1000000000 for 1000 USDC (6 decimals)>
    }
  ],
  "reason": "<2-3 sentences: what you decided, why, and expected outcome>",
  "suggestedAPY": <integer basis points, e.g. 680 for 6.8%>,
  "riskScore": <integer 1-10>,
  "confidence": <float 0.0-1.0>,
  "expectedDailyYieldUSD": <float, estimated daily yield for the position>,
  "rebalanceNeeded": <boolean>
}`;

// ── Build rich user message with full portfolio context ───────────────────────
function buildUserMessage(
  instruction: string,
  currentAsset: string,
  currentProtocol: string,
  currentAmount: number,
  portfolio?: PortfolioPosition[]
): string {
  const positionUSD = currentAmount / 1e6;
  const dailyYieldCurrent = (positionUSD * 0.045) / 365; // rough estimate

  let portfolioStr = `Current position: ${positionUSD.toFixed(2)} ${currentAsset} on ${currentProtocol}`;
  if (portfolio && portfolio.length > 0) {
    const totalUSD = portfolio.reduce((s, p) => s + p.amountUSD, 0);
    portfolioStr = `Full portfolio (total $${totalUSD.toFixed(2)} USD):\n` +
      portfolio.map(p =>
        `  - ${p.amountUSD.toFixed(2)} ${p.symbol} on ${p.protocol} @ ${(p.apy / 100).toFixed(2)}% APY`
      ).join("\n");
  }

  return `USER INSTRUCTION: "${instruction}"

${portfolioStr}

Analyze this instruction carefully. Consider:
- The user's risk tolerance implied by their words
- Whether the current allocation is already optimal
- The net benefit of any rebalancing after gas costs
- What outcome the user actually wants (safety vs yield vs both)

Provide your yield optimization decision.`;
}

// ── Main export ───────────────────────────────────────────────────────────────
export async function dashscopeLLMDecision(
  instruction: string,
  currentAsset = "USDC",
  currentProtocol: "Aave" | "Morpho" = "Aave",
  currentAmount = 1000e6,
  portfolio?: PortfolioPosition[]
): Promise<LLMDecision> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) {
    console.warn("[DashScope] No API key — falling back to mock");
    return mockLLMDecision(instruction, currentAsset, currentProtocol, currentAmount);
  }

  const userMessage = buildUserMessage(instruction, currentAsset, currentProtocol, currentAmount, portfolio);

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user",   content: userMessage },
        ],
        temperature: 0.15,
        max_tokens: 2048,
        top_p: 0.85,
        enable_thinking: false,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("[DashScope] API error:", res.status, err);
      return mockLLMDecision(instruction, currentAsset, currentProtocol, currentAmount);
    }

    const data = await res.json() as any;
    const rawContent: string = data?.choices?.[0]?.message?.content ?? "";

    // Strip <think>...</think> chain-of-thought blocks (keep for logging)
    const thinkMatch = rawContent.match(/<think>([\s\S]*?)<\/think>/);
    if (thinkMatch) {
      console.log("[DashScope] CoT reasoning:", thinkMatch[1].trim().slice(0, 300) + "...");
    }
    const content = rawContent.replace(/<think>[\s\S]*?<\/think>/g, "").trim();

    // Extract JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response: " + content.slice(0, 300));

    const parsed = JSON.parse(jsonMatch[0]) as LLMDecision & {
      confidence?: number;
      expectedDailyYieldUSD?: number;
      rebalanceNeeded?: boolean;
    };

    if (typeof parsed.reason !== "string" || typeof parsed.suggestedAPY !== "number") {
      throw new Error("Invalid response shape: " + JSON.stringify(parsed).slice(0, 200));
    }

    console.log(
      `[DashScope] ✓ Decision: ${parsed.reason} | APY: ${parsed.suggestedAPY}bps | Risk: ${parsed.riskScore}/10` +
      (parsed.confidence ? ` | Confidence: ${(parsed.confidence * 100).toFixed(0)}%` : "")
    );

    return parsed;

  } catch (err) {
    console.error("[DashScope] Parse/fetch error — falling back to mock:", err);
    return mockLLMDecision(instruction, currentAsset, currentProtocol, currentAmount);
  }
}
