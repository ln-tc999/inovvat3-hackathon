import OpenAI from "openai";
import type { LLMDecision, PoolData } from "@autoyield/shared";

const client = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY!,
});

const MODEL = process.env.OPENROUTER_MODEL ?? "qwen/qwen-2.5-72b-instruct";

export async function getYieldDecision(
  userInstruction: string,
  balances: Record<string, string>,
  pools: PoolData[],
  maxRisk: number
): Promise<LLMDecision> {
  const prompt = `You are an elite DeFi yield optimizer agent running on Base blockchain.

User instruction: ${userInstruction}
Current holdings (asset → amount in wei): ${JSON.stringify(balances)}
Available pools: ${JSON.stringify(pools)}
Constraints:
- Max risk score: ${maxRisk} (scale 1-10)
- Only stablecoins if "low risk" or "stable" mentioned
- Prefer Morpho for stablecoins on Base when APY is competitive
- Never exceed daily limits set by user policy
- Minimize gas by batching when possible

Output ONLY valid JSON (no markdown, no explanation outside JSON):
{
  "actions": [
    {"protocol": "<adapter_address>", "action": "SUPPLY|WITHDRAW", "asset": "<token_address>", "amount": "<amount_in_wei_or_0_for_all>"}
  ],
  "reason": "<brief explanation under 100 chars>"
}`;

  const response = await client.chat.completions.create({
    model: MODEL,
    messages: [{ role: "user", content: prompt }],
    temperature: 0.1,
    max_tokens: 512,
  });

  const content = response.choices[0]?.message?.content ?? "{}";

  // Strip markdown code fences if present
  const cleaned = content.replace(/```json?\n?/g, "").replace(/```/g, "").trim();

  const parsed: LLMDecision = JSON.parse(cleaned);
  return parsed;
}
