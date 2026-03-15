import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { dashscopeLLMDecision } from "../services/dashscopeLLM.js";
import { runMockUpkeep, DEFAULT_PORTFOLIO } from "../services/yieldOptimizer.js";
import { generateRiskProfile } from "../services/profileGenerator.js";
import type { AgentStatus } from "../types.js";

export const agentRouter = new Hono();

// ── In-memory state (mock for hackathon — no DB needed server-side) ───────────
// Real persistence lives in client-side IndexedDB via Dexie.js
let agentState: AgentStatus = {
  active: false,
  agentId: "agent-" + Math.random().toString(36).slice(2, 9),
  lastAction: "Waiting for instruction",
  lastActionAt: Date.now(),
  currentAPY: 450,
  instruction: "",
  totalProfitUSD: 0,
  portfolio: DEFAULT_PORTFOLIO,
};

// ── Schemas ───────────────────────────────────────────────────────────────────
const setInstructionSchema = z.object({
  instruction: z.string().min(5, "Instruction too short").max(500),
  maxRisk: z.number().min(1).max(10).optional(),
  userAddress: z.string().optional(),
});

const pauseSchema = z.object({
  active: z.boolean(),
});

// ── POST /api/agent/set-instruction ──────────────────────────────────────────
agentRouter.post(
  "/set-instruction",
  zValidator("json", setInstructionSchema),
  async (c) => {
    const { instruction, maxRisk } = c.req.valid("json");

    // Call DashScope Qwen LLM (falls back to mock if no API key)
    const decision = await dashscopeLLMDecision(instruction);

    agentState = {
      ...agentState,
      active: true,
      instruction,
      lastAction: decision.reason,
      lastActionAt: Date.now(),
      currentAPY: decision.suggestedAPY,
    };

    return c.json({
      success: true,
      agentId: agentState.agentId,
      preview: decision.reason,
      suggestedAPY: decision.suggestedAPY,
      riskScore: decision.riskScore,
    });
  }
);

// ── GET /api/agent/status ─────────────────────────────────────────────────────
agentRouter.get("/status", (c) => {
  return c.json(agentState);
});

// ── POST /api/agent/pause ─────────────────────────────────────────────────────
agentRouter.post("/pause", zValidator("json", pauseSchema), (c) => {
  const { active } = c.req.valid("json");
  agentState = { ...agentState, active };
  return c.json({ success: true, active });
});

// ── POST /api/agent/mock-upkeep ───────────────────────────────────────────────
// Mock for hackathon - simulates Chainlink Automation trigger every 6h
agentRouter.post("/mock-upkeep", async (c) => {
  if (!agentState.active) {
    return c.json({ error: "Agent is paused" }, 400);
  }

  const result = await runMockUpkeep(agentState.instruction || "maximize yield", agentState.portfolio);

  // Accumulate profit
  const dailyYield = result.newPortfolio.reduce((sum, p) => sum + p.yieldEarnedToday, 0);
  agentState = {
    ...agentState,
    portfolio: result.newPortfolio,
    currentAPY: result.newAPY,
    lastAction: result.reason,
    lastActionAt: Date.now(),
    totalProfitUSD: agentState.totalProfitUSD + dailyYield,
  };

  return c.json({
    actions: result.actions,
    reason: result.reason,
    newPortfolio: result.newPortfolio,
    newAPY: result.newAPY,
  });
});

// ── POST /api/agent/generate-profile ─────────────────────────────────────────
const generateProfileSchema = z.object({
  riskTier:        z.enum(["conservative", "moderate", "aggressive"]),
  preferredAssets: z.array(z.string()).min(1),
  timeHorizon:     z.enum(["short", "medium", "long"]),
  yieldTarget:     z.number().min(1).max(50),
  walletAddress:   z.string().optional(),
});

agentRouter.post(
  "/generate-profile",
  zValidator("json", generateProfileSchema),
  async (c) => {
    const body = c.req.valid("json");
    const profile = await generateRiskProfile(body);
    return c.json(profile);
  }
);

// ── POST /api/agent/deposit ───────────────────────────────────────────────────
// Triggers on-chain SUPPLY via executeManual (requires user to have approved adapter)
const depositSchema = z.object({
  userAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
  asset:       z.enum(["USDC", "WETH"]),
  amount:      z.number().positive(),
  protocol:    z.enum(["aave", "morpho"]).default("aave"),
});

agentRouter.post(
  "/deposit",
  zValidator("json", depositSchema),
  async (c) => {
    const { userAddress, asset, amount, protocol } = c.req.valid("json");

    const { executeSupply, isOnChainEnabled } = await import("../services/onchain.js");

    if (!isOnChainEnabled()) {
      return c.json({ error: "On-chain execution not configured (BACKEND_PRIVATE_KEY missing)" }, 503);
    }

    try {
      const txHash = await executeSupply(userAddress as `0x${string}`, asset, amount, protocol);
      return c.json({ success: true, txHash, asset, amount, protocol });
    } catch (err: any) {
      console.error("[Deposit] Error:", err);
      return c.json({ error: err?.shortMessage ?? err?.message ?? "Transaction failed" }, 500);
    }
  }
);

// ── POST /api/agent/withdraw ──────────────────────────────────────────────────
const withdrawSchema = z.object({
  userAddress: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
  asset:       z.enum(["USDC", "WETH"]),
  amount:      z.number().positive(),
  protocol:    z.enum(["aave", "morpho"]).default("aave"),
});

agentRouter.post(
  "/withdraw",
  zValidator("json", withdrawSchema),
  async (c) => {
    const { userAddress, asset, amount, protocol } = c.req.valid("json");

    const { executeWithdraw, isOnChainEnabled } = await import("../services/onchain.js");

    if (!isOnChainEnabled()) {
      return c.json({ error: "On-chain execution not configured (BACKEND_PRIVATE_KEY missing)" }, 503);
    }

    try {
      const txHash = await executeWithdraw(userAddress as `0x${string}`, asset, amount, protocol);
      return c.json({ success: true, txHash, asset, amount, protocol });
    } catch (err: any) {
      console.error("[Withdraw] Error:", err);
      return c.json({ error: err?.shortMessage ?? err?.message ?? "Transaction failed" }, 500);
    }
  }
);

// ── GET /api/agent/portfolio/:address ────────────────────────────────────────
agentRouter.get("/portfolio/:address", async (c) => {
  const address = c.req.param("address") as `0x${string}`;
  const { getOnChainPortfolio, isOnChainEnabled } = await import("../services/onchain.js");

  if (!isOnChainEnabled()) {
    // Fall back to mock portfolio
    return c.json({ onChain: false, portfolio: agentState.portfolio });
  }

  const positions = await getOnChainPortfolio(address);
  return c.json({ onChain: true, positions });
});

// ── POST /api/agent/faucet ────────────────────────────────────────────────────
// Testnet only — mint MockUSDC to any address
const faucetSchema = z.object({
  address: z.string().regex(/^0x[0-9a-fA-F]{40}$/, "Invalid address"),
  amount:  z.number().positive().max(10000).default(1000),
});

agentRouter.post(
  "/faucet",
  zValidator("json", faucetSchema),
  async (c) => {
    const { address, amount } = c.req.valid("json");
    const MOCK_USDC = process.env.MOCK_USDC_ADDRESS as `0x${string}` | undefined;

    if (!MOCK_USDC) {
      return c.json({ error: "MOCK_USDC_ADDRESS not configured" }, 503);
    }

    const { createWalletClient, createPublicClient, http, parseUnits } = await import("viem");
    const { privateKeyToAccount } = await import("viem/accounts");
    const { baseSepolia } = await import("viem/chains");

    const BACKEND_PRIVATE_KEY = process.env.BACKEND_PRIVATE_KEY as `0x${string}`;
    const RPC_URL = process.env.RPC_URL_BASE_SEPOLIA ?? "https://sepolia.base.org";

    const account = privateKeyToAccount(BACKEND_PRIVATE_KEY);
    const walletClient = createWalletClient({ account, chain: baseSepolia, transport: http(RPC_URL) });
    const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC_URL) });

    const MINT_ABI = [{
      name: "mint",
      type: "function",
      stateMutability: "nonpayable",
      inputs: [{ name: "to", type: "address" }, { name: "amount", type: "uint256" }],
      outputs: [],
    }] as const;

    try {
      const hash = await walletClient.writeContract({
        address: MOCK_USDC,
        abi: MINT_ABI,
        functionName: "mint",
        args: [address as `0x${string}`, parseUnits(String(amount), 6)],
      });
      await publicClient.waitForTransactionReceipt({ hash });
      return c.json({ success: true, txHash: hash, address, amount, token: MOCK_USDC });
    } catch (err: any) {
      return c.json({ error: err?.shortMessage ?? err?.message ?? "Mint failed" }, 500);
    }
  }
);
