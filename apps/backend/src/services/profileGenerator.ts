/**
 * AI Risk Profile Generator
 * Uses Qwen LLM to generate a personalized agent profile from onboarding answers
 */
import { mockLLMDecision } from "./mockLLM.js";

const BASE_URL = "https://dashscope-intl.aliyuncs.com/compatible-mode/v1";
const MODEL    = "qwen3-235b-a22b";

export interface OnboardingAnswers {
  riskTier:        "conservative" | "moderate" | "aggressive";
  preferredAssets: string[];
  timeHorizon:     "short" | "medium" | "long";
  yieldTarget:     number;
  walletAddress?:  string;
}

export interface GeneratedProfile {
  agentName:            string;
  agentPersonality:     string;
  generatedInstruction: string;
  maxRisk:              number;   // 1-10
  dailyLimitUSD:        number;
  suggestedAPY:         number;   // basis points
  reasoning:            string;
}

const TIER_DEFAULTS = {
  conservative: { maxRisk: 3,  dailyLimit: 500,   apyRange: "3-5%" },
  moderate:     { maxRisk: 5,  dailyLimit: 2000,  apyRange: "5-8%" },
  aggressive:   { maxRisk: 8,  dailyLimit: 10000, apyRange: "8-12%" },
};

const HORIZON_MAP = {
  short:  "1-3 months",
  medium: "3-12 months",
  long:   "1+ years",
};

export async function generateRiskProfile(answers: OnboardingAnswers): Promise<GeneratedProfile> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  const defaults = TIER_DEFAULTS[answers.riskTier];

  if (!apiKey) return mockProfile(answers, defaults);

  const prompt = `You are a DeFi AI agent configurator. Based on a user's onboarding answers, generate a personalized agent profile.

USER ANSWERS:
- Risk tolerance: ${answers.riskTier}
- Preferred assets: ${answers.preferredAssets.join(", ")}
- Time horizon: ${HORIZON_MAP[answers.timeHorizon]}
- Yield target: ${answers.yieldTarget}% APY

AVAILABLE PROTOCOLS (Base Sepolia):
- Aave V3: USDC 4.5%, DAI 3.9%, USDT 4.2% — risk score 2/10
- Morpho:  USDC 6.8%, DAI 5.9%             — risk score 3/10

Generate a profile. Return ONLY valid JSON:
{
  "agentName": "<creative 3-word name like 'The Steady Earner' or 'The Yield Hunter'>",
  "agentPersonality": "<1 sentence describing the agent's strategy style>",
  "generatedInstruction": "<natural language instruction for the agent, 1-2 sentences, specific to their preferences>",
  "maxRisk": <integer 1-10 matching their risk tier>,
  "dailyLimitUSD": <integer, reasonable daily limit in USD>,
  "suggestedAPY": <integer basis points, realistic for their risk tier>,
  "reasoning": "<2 sentences explaining why this configuration suits them>"
}`;

  try {
    const res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,  // slightly creative for naming
        max_tokens: 512,
        enable_thinking: false,
      }),
    });

    if (!res.ok) throw new Error(`API ${res.status}`);

    const data = await res.json() as any;
    const content: string = data?.choices?.[0]?.message?.content ?? "";
    const cleaned = content.replace(/<think>[\s\S]*?<\/think>/g, "").trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON");

    const parsed = JSON.parse(jsonMatch[0]) as GeneratedProfile;
    console.log(`[ProfileGen] Generated: ${parsed.agentName} | Risk: ${parsed.maxRisk}/10`);
    return parsed;

  } catch (err) {
    console.error("[ProfileGen] Error, using defaults:", err);
    return mockProfile(answers, defaults);
  }
}

function mockProfile(answers: OnboardingAnswers, defaults: typeof TIER_DEFAULTS["conservative"]): GeneratedProfile {
  const names = {
    conservative: "The Steady Earner",
    moderate:     "The Balanced Optimizer",
    aggressive:   "The Yield Hunter",
  };
  const personalities = {
    conservative: "Prioritizes capital preservation with steady, low-risk yield.",
    moderate:     "Balances yield optimization with manageable risk exposure.",
    aggressive:   "Maximizes yield by actively seeking the highest APY opportunities.",
  };
  const instructions = {
    conservative: `Maximize yield on ${answers.preferredAssets.join("/")} with low risk only. Prefer Aave V3. Never exceed risk score 3.`,
    moderate:     `Optimize yield on ${answers.preferredAssets.join("/")} with moderate risk. Rebalance between Aave and Morpho for best APY.`,
    aggressive:   `Aggressively maximize yield on ${answers.preferredAssets.join("/")}. Use Morpho when APY advantage exceeds 1%. Compound frequently.`,
  };

  return {
    agentName:            names[answers.riskTier],
    agentPersonality:     personalities[answers.riskTier],
    generatedInstruction: instructions[answers.riskTier],
    maxRisk:              defaults.maxRisk,
    dailyLimitUSD:        defaults.dailyLimit,
    suggestedAPY:         answers.riskTier === "aggressive" ? 680 : answers.riskTier === "moderate" ? 550 : 450,
    reasoning:            `Based on your ${answers.riskTier} risk preference and ${HORIZON_MAP[answers.timeHorizon]} horizon, this configuration optimizes for ${defaults.apyRange} APY range.`,
  };
}
