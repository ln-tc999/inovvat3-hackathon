import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { dashscopeLLMDecision } from "../services/dashscopeLLM.js";
import { runMockUpkeep, DEFAULT_PORTFOLIO } from "../services/yieldOptimizer.js";
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
