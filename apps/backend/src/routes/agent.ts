import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { keccak256, toBytes, encodeAbiParameters, parseAbiParameters } from "viem";
import { getYieldDecision } from "../lib/llm.js";
import { getUserPolicy } from "../lib/chain.js";
import type { PoolData } from "@autoyield/shared";

export const agentRouter = new Hono();

const instructionSchema = z.object({
  userAddress: z.string().startsWith("0x"),
  instruction: z.string().min(5).max(500),
  maxRisk: z.number().min(1).max(10).optional(),
});

// Mock pool data — in production fetch from The Graph / Chainlink oracle
const MOCK_POOLS: PoolData[] = [
  { protocol: "Aave V3", asset: "USDC", apy: 450, riskScore: 2, tvl: BigInt("50000000000000") },
  { protocol: "Morpho Blue", asset: "USDC", apy: 620, riskScore: 3, tvl: BigInt("20000000000000") },
];

/// POST /api/agent/instruct — store instruction and get LLM preview
agentRouter.post(
  "/instruct",
  zValidator("json", instructionSchema),
  async (c) => {
    const { userAddress, instruction, maxRisk } = c.req.valid("json");

    const policy = await getUserPolicy(userAddress as `0x${string}`).catch(() => null);
    const effectiveRisk = maxRisk ?? policy?.maxRisk ?? 5;

    const decision = await getYieldDecision(
      instruction,
      {}, // balances fetched on-chain in production
      MOCK_POOLS,
      effectiveRisk
    );

    const instructionHash = keccak256(toBytes(instruction));

    return c.json({
      instructionHash,
      decision,
      preview: `Agent will: ${decision.reason}`,
    });
  }
);

/// GET /api/agent/status/:address
agentRouter.get("/status/:address", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const policy = await getUserPolicy(address).catch(() => null);

  if (!policy) {
    return c.json({ error: "No policy found" }, 404);
  }

  return c.json({
    active: policy.active,
    maxRisk: policy.maxRisk,
    sessionExpiry: policy.sessionExpiry.toString(),
    dailyLimit: policy.dailyLimit.toString(),
  });
});
