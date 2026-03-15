import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getRiskProfile } from "../../../lib/db";
import { apiClient } from "../../../lib/api";
import { Bot, Shield, Calendar, Wallet } from "lucide-react";

const TIER_COLOR: Record<string, string> = {
  conservative: "#22c55e",
  moderate:     "var(--accent-2)",
  aggressive:   "var(--accent)",
};

const TIER_LABEL: Record<string, string> = {
  conservative: "Conservative",
  moderate:     "Moderate",
  aggressive:   "Aggressive",
};

export default function AgentIdentityCard() {
  const { address } = useAccount();

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const tierColor = TIER_COLOR[profile?.riskTier ?? "moderate"];
  const createdAt = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
    : "—";

  return (
    <div className="d-card flex flex-col gap-5">
      <div className="flex items-start gap-4">
        {/* Avatar */}
        <div style={{
          width: 56, height: 56, borderRadius: 14, flexShrink: 0,
          background: "color-mix(in srgb, var(--accent) 12%, var(--surface-2))",
          border: "1px solid var(--border)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--accent)",
        }}>
          <Bot size={26} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="flex items-center gap-2 flex-wrap">
            <p style={{ fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              {profile?.agentName ?? "Your Agent"}
            </p>
            <span className={`d-badge ${status?.active ? "d-badge-cyan" : "d-badge-red"}`} style={{ fontSize: 11 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: status?.active ? "var(--accent-2)" : "var(--danger)", display: "inline-block" }} />
              {status?.active ? "Active" : "Paused"}
            </span>
          </div>
          {profile?.riskTier && (
            <span style={{
              display: "inline-block", marginTop: 6,
              padding: "2px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
              background: `color-mix(in srgb, ${tierColor} 12%, var(--surface))`,
              border: `1px solid ${tierColor}`,
              color: tierColor,
            }}>
              {TIER_LABEL[profile.riskTier]} Risk
            </span>
          )}
        </div>
      </div>

      {/* Meta grid */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {[
          { icon: <Wallet size={14} />, label: "Wallet", value: address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—" },
          { icon: <Calendar size={14} />, label: "Created", value: createdAt },
          { icon: <Shield size={14} />, label: "Daily Limit", value: profile?.dailyLimitUSD ? `$${profile.dailyLimitUSD.toLocaleString()}` : "—" },
          { icon: <Shield size={14} />, label: "Yield Target", value: profile?.yieldTarget ? `${profile.yieldTarget}% APY` : "—" },
        ].map((item) => (
          <div key={item.label} style={{
            padding: "10px 12px", borderRadius: 8,
            background: "var(--surface-2)", border: "1px solid var(--border)",
          }}>
            <div className="flex items-center gap-2" style={{ color: "var(--muted)", marginBottom: 4 }}>
              {item.icon}
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600 }}>{item.label}</span>
            </div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>{item.value}</p>
          </div>
        ))}
      </div>

      {/* Agent personality */}
      {profile?.generatedInstruction && (
        <div style={{
          padding: "10px 14px", borderRadius: 8,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          fontSize: 13, color: "var(--muted)", lineHeight: 1.6,
          borderLeft: `3px solid var(--accent)`,
        }}>
          <span style={{ fontWeight: 600, color: "var(--text)" }}>Current strategy: </span>
          {profile.generatedInstruction}
        </div>
      )}
    </div>
  );
}
