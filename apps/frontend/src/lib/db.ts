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

class YieldGuardDB extends Dexie {
  history!: Table<AgentHistoryEntry>;
  prefs!: Table<UserPrefs>;
  snapshots!: Table<ProfitSnapshot>;

  constructor() {
    super("YieldGuardDB");
    this.version(1).stores({
      history:   "++id, timestamp",
      prefs:     "++id, key",
      snapshots: "++id, date",
    });
  }
}

export const db = new YieldGuardDB();

export async function addHistoryEntry(entry: Omit<AgentHistoryEntry, "id">) {
  return db.history.add(entry);
}

export async function getHistory(limit = 50) {
  return db.history.orderBy("timestamp").reverse().limit(limit).toArray();
}

export async function addProfitSnapshot(snapshot: Omit<ProfitSnapshot, "id">) {
  // Upsert by date
  const existing = await db.snapshots.where("date").equals(snapshot.date).first();
  if (existing?.id) {
    return db.snapshots.update(existing.id, snapshot);
  }
  return db.snapshots.add(snapshot);
}

export async function getProfitSnapshots(days = 30) {
  return db.snapshots.orderBy("date").reverse().limit(days).toArray();
}

export async function setPref(key: string, value: string) {
  const existing = await db.prefs.where("key").equals(key).first();
  if (existing?.id) return db.prefs.update(existing.id, { value });
  return db.prefs.add({ key, value });
}

export async function getPref(key: string): Promise<string | null> {
  const row = await db.prefs.where("key").equals(key).first();
  return row?.value ?? null;
}
