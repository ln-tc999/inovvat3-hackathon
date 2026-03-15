/**
 * Automation Service
 * Two trigger paths for 24/7 yield optimization:
 *
 * 1. PRIMARY  — Chainlink Automation: listens for UpkeepPerformed event on-chain
 * 2. FALLBACK — node-cron: runs every 6h independently
 *
 * Both paths → dashscopeLLM → executeManual on-chain
 */

import cron from "node-cron";
import { dashscopeLLMDecision } from "./dashscopeLLM.js";
import { executeSupply, executeWithdraw, isOnChainEnabled, publicClient, SUPPORTED_ASSETS } from "./onchain.js";
import type { Address } from "viem";

// ── Config ────────────────────────────────────────────────────────────────────

const AUTO_YIELD_CONSUMER = (process.env.AUTO_YIELD_CONSUMER_ADDRESS ?? "") as Address;
const AGENT_WALLET        = (process.env.AGENT_WALLET_ADDRESS ?? process.env.DEPLOYER_ADDRESS ?? "") as Address;

// Default instruction used when no user-specific instruction is stored
const DEFAULT_INSTRUCTION = "Maximize yield with low risk on stablecoins. Prefer Aave for stability.";

// Shared in-memory agent state (imported from agent router via module state)
// We export a setter so agent.ts can keep this in sync
let currentInstruction = DEFAULT_INSTRUCTION;
let agentActive        = false;

export function setAutomationInstruction(instruction: string) {
  currentInstruction = instruction;
}

export function setAutomationActive(active: boolean) {
  agentActive = active;
}

// ── ABI for AutoYieldConsumer UpkeepPerformed event ───────────────────────────

const UPKEEP_ABI = [
  {
    name: "UpkeepPerformed",
    type: "event",
    inputs: [{ name: "timestamp", type: "uint256", indexed: false }],
  },
] as const;

// ── Core execution logic ──────────────────────────────────────────────────────

export async function runAutomatedUpkeep(triggeredBy: "chainlink" | "cron"): Promise<void> {
  if (!agentActive) {
    console.log(`[Automation] Skipped — agent is paused (trigger: ${triggeredBy})`);
    return;
  }

  if (!isOnChainEnabled()) {
    console.log(`[Automation] Skipped — on-chain not configured (trigger: ${triggeredBy})`);
    return;
  }

  console.log(`[Automation] Running upkeep — trigger: ${triggeredBy}`);

  try {
    // 1. Ask LLM for decision
    const decision = await dashscopeLLMDecision(currentInstruction);
    console.log(`[Automation] LLM decision: ${decision.reason} | APY: ${decision.suggestedAPY}bps | Risk: ${decision.riskScore}`);

    // 2. Execute on-chain based on LLM recommendation
    // For MVP: always supply USDC to Aave (most stable action)
    // In production: parse decision.actions for specific protocol/asset/amount
    const userAddress = AGENT_WALLET || ("0x72092971935F31734118fD869A768aE17C84dd0B" as Address);

    if (decision.riskScore <= 7) {
      // Low-moderate risk: supply to Aave
      const txHash = await executeSupply(userAddress, "USDC", 1, "aave");
      console.log(`[Automation] SUPPLY executed — tx: ${txHash} (trigger: ${triggeredBy})`);
    } else {
      console.log(`[Automation] Risk too high (${decision.riskScore}/10) — skipping execution`);
    }
  } catch (err: any) {
    console.error(`[Automation] Upkeep failed (trigger: ${triggeredBy}):`, err?.message ?? err);
  }
}

// ── 1. Chainlink event watcher ────────────────────────────────────────────────

let chainlinkUnwatch: (() => void) | null = null;

export function startChainlinkWatcher(): void {
  if (!AUTO_YIELD_CONSUMER) {
    console.warn("[Automation] AUTO_YIELD_CONSUMER_ADDRESS not set — Chainlink watcher disabled");
    return;
  }

  console.log(`[Automation] Watching UpkeepPerformed on ${AUTO_YIELD_CONSUMER}`);

  chainlinkUnwatch = publicClient.watchContractEvent({
    address: AUTO_YIELD_CONSUMER,
    abi: UPKEEP_ABI,
    eventName: "UpkeepPerformed",
    onLogs: (logs) => {
      for (const log of logs) {
        const ts = (log as any).args?.timestamp;
        console.log(`[Automation] Chainlink UpkeepPerformed detected — block timestamp: ${ts}`);
        runAutomatedUpkeep("chainlink");
      }
    },
    onError: (err) => {
      console.error("[Automation] Chainlink watcher error:", err.message);
    },
  });
}

export function stopChainlinkWatcher(): void {
  chainlinkUnwatch?.();
  chainlinkUnwatch = null;
  console.log("[Automation] Chainlink watcher stopped");
}

// ── 2. Cron fallback (every 6 hours) ─────────────────────────────────────────

let cronTask: ReturnType<typeof cron.schedule> | null = null;

export function startCronFallback(): void {
  // "0 */6 * * *" = every 6 hours at :00
  // For dev/testing: use "*/30 * * * * *" (every 30s) — controlled by env
  const schedule = process.env.CRON_SCHEDULE ?? "0 */6 * * *";

  console.log(`[Automation] Cron fallback scheduled: "${schedule}"`);

  cronTask = cron.schedule(schedule, async () => {
    console.log("[Automation] Cron triggered");
    await runAutomatedUpkeep("cron");
  });
}

export function stopCronFallback(): void {
  cronTask?.stop();
  cronTask = null;
  console.log("[Automation] Cron fallback stopped");
}

// ── Start both ────────────────────────────────────────────────────────────────

export function startAutomation(): void {
  startChainlinkWatcher();
  startCronFallback();
  console.log("[Automation] Both triggers active (Chainlink watcher + Cron fallback)");
}

export function stopAutomation(): void {
  stopChainlinkWatcher();
  stopCronFallback();
}
