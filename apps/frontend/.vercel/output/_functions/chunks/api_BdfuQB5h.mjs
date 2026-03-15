import Dexie from 'dexie';

class YieldGuardDB extends Dexie {
  history;
  prefs;
  snapshots;
  riskProfiles;
  constructor() {
    super("YieldGuardDB");
    this.version(1).stores({
      history: "++id, timestamp",
      prefs: "++id, key",
      snapshots: "++id, date"
    });
    this.version(2).stores({
      history: "++id, timestamp",
      prefs: "++id, key",
      snapshots: "++id, date",
      riskProfiles: "++id, walletAddress"
    });
  }
}
const db = new YieldGuardDB();
async function addHistoryEntry(entry) {
  return db.history.add(entry);
}
async function addProfitSnapshot(snapshot) {
  const existing = await db.snapshots.where("date").equals(snapshot.date).first();
  if (existing?.id) return db.snapshots.update(existing.id, snapshot);
  return db.snapshots.add(snapshot);
}
async function getProfitSnapshots(days = 30) {
  return db.snapshots.orderBy("date").reverse().limit(days).toArray();
}
async function getRiskProfile(walletAddress) {
  const row = await db.riskProfiles.where("walletAddress").equals(walletAddress.toLowerCase()).first();
  return row ?? null;
}
async function saveRiskProfile(profile) {
  const existing = await db.riskProfiles.where("walletAddress").equals(profile.walletAddress.toLowerCase()).first();
  if (existing?.id) {
    await db.riskProfiles.update(existing.id, { ...profile, updatedAt: Date.now() });
  } else {
    await db.riskProfiles.add({ ...profile, walletAddress: profile.walletAddress.toLowerCase() });
  }
}
async function isOnboardingComplete(walletAddress) {
  const profile = await getRiskProfile(walletAddress);
  return profile?.onboardingComplete ?? false;
}

const BASE_URL = typeof window !== "undefined" ? "https://autoyieldbackend-production.up.railway.app" : "";
async function apiFetch(path, init) {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Unknown error" }));
    throw new Error(err.message ?? "Request failed");
  }
  return res.json();
}
const apiClient = {
  setInstruction: (body) => apiFetch("/agent/set-instruction", {
    method: "POST",
    body: JSON.stringify(body)
  }),
  getStatus: () => apiFetch("/agent/status"),
  pause: (active) => apiFetch("/agent/pause", {
    method: "POST",
    body: JSON.stringify({ active })
  }),
  mockUpkeep: () => apiFetch("/agent/mock-upkeep", { method: "POST" }),
  generateProfile: (body) => apiFetch("/agent/generate-profile", {
    method: "POST",
    body: JSON.stringify(body)
  })
};

export { apiClient as a, addHistoryEntry as b, addProfitSnapshot as c, getProfitSnapshots as d, getRiskProfile as g, isOnboardingComplete as i, saveRiskProfile as s };
