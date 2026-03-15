// Client-side persistence via Dexie.js (IndexedDB)
// Server is stateless — all user history lives here

import Dexie, { type Table } from "dexie";

export interface AgentHistoryEntry {
  id?: number;
  timestamp: number;
  action: string;
  reason: string;
  apyBps: number;
  profitUSD: number;
}

export interface UserPrefs {
  id?: number;
  key: string;
  value: string;
}

export interface ProfitSnapshot {
  id?: number;
  date: string;       // YYYY-MM-DD
  profitUSD: number;
  apyBps: number;
}

export type RiskTier = "conservative" | "moderate" | "aggressive";

export interface RiskProfile {
  id?: number;
  walletAddress: string;
  userName: string;          // display name from onboarding
  riskTier: RiskTier;
  maxRisk: number;           // 1-10
  dailyLimitUSD: number;     // max USD agent can move per day
  preferredAssets: string[]; // ["USDC", "DAI", "USDT"]
  timeHorizon: "short" | "medium" | "long";
  yieldTarget: number;       // % APY target
  agentName: string;         // e.g. "The Steady Earner"
  generatedInstruction: string;
  onboardingComplete: boolean;
  createdAt: number;
  updatedAt: number;
}

class YieldGuardDB extends Dexie {
  history!: Table<AgentHistoryEntry>;
  prefs!: Table<UserPrefs>;
  snapshots!: Table<ProfitSnapshot>;
  riskProfiles!: Table<RiskProfile>;

  constructor() {
    super("YieldGuardDB");
    this.version(1).stores({
      history:   "++id, timestamp",
      prefs:     "++id, key",
      snapshots: "++id, date",
    });
    // v2: add riskProfiles
    this.version(2).stores({
      history:      "++id, timestamp",
      prefs:        "++id, key",
      snapshots:    "++id, date",
      riskProfiles: "++id, walletAddress",
    });
  }
}

export const db = new YieldGuardDB();

// ── History ───────────────────────────────────────────────────────────────────
export async function addHistoryEntry(entry: Omit<AgentHistoryEntry, "id">) {
  return db.history.add(entry);
}

export async function getHistory(limit = 50) {
  return db.history.orderBy("timestamp").reverse().limit(limit).toArray();
}

// ── Profit Snapshots ──────────────────────────────────────────────────────────
export async function addProfitSnapshot(snapshot: Omit<ProfitSnapshot, "id">) {
  const existing = await db.snapshots.where("date").equals(snapshot.date).first();
  if (existing?.id) return db.snapshots.update(existing.id, snapshot);
  return db.snapshots.add(snapshot);
}

export async function getProfitSnapshots(days = 30) {
  return db.snapshots.orderBy("date").reverse().limit(days).toArray();
}

// ── Prefs ─────────────────────────────────────────────────────────────────────
export async function setPref(key: string, value: string) {
  const existing = await db.prefs.where("key").equals(key).first();
  if (existing?.id) return db.prefs.update(existing.id, { value });
  return db.prefs.add({ key, value });
}

export async function getPref(key: string): Promise<string | null> {
  const row = await db.prefs.where("key").equals(key).first();
  return row?.value ?? null;
}

// ── Risk Profile ──────────────────────────────────────────────────────────────
export async function getRiskProfile(walletAddress: string): Promise<RiskProfile | null> {
  const row = await db.riskProfiles.where("walletAddress").equals(walletAddress.toLowerCase()).first();
  return row ?? null;
}

export async function saveRiskProfile(profile: Omit<RiskProfile, "id">): Promise<void> {
  const existing = await db.riskProfiles
    .where("walletAddress").equals(profile.walletAddress.toLowerCase()).first();
  if (existing?.id) {
    await db.riskProfiles.update(existing.id, { ...profile, updatedAt: Date.now() });
  } else {
    await db.riskProfiles.add({ ...profile, walletAddress: profile.walletAddress.toLowerCase() });
  }
}

export async function isOnboardingComplete(walletAddress: string): Promise<boolean> {
  const profile = await getRiskProfile(walletAddress);
  return profile?.onboardingComplete ?? false;
}
