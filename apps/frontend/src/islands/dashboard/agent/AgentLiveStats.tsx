import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../../lib/api";
import { TrendingUp, DollarSign, Shield, Clock, Radio, Timer } from "lucide-react";

const BASE_URL = typeof window !== "undefined" ? (import.meta.env.PUBLIC_API_URL ?? "") : "";

async function getAutomationStatus() {
  const res = await fetch(`${BASE_URL}/api/agent/automation-status`);
  return res.json() as Promise<{
    chainlinkWatcher: boolean;
    cronSchedule: string;
    onChainEnabled: boolean;
    agentActive: boolean;
    consumerAddress: string | null;
  }>;
}

function timeAgo(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AgentLiveStats() {
  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 10_000,
  });

  const { data: automation } = useQuery({
    queryKey: ["automation-status"],
    queryFn: getAutomationStatus,
    refetchInterval: 30_000,
  });

  const stats = [
    {
      icon: <TrendingUp size={16} />,
      label: "Current APY",
      value: status ? `${(status.currentAPY / 100).toFixed(2)}%` : "—",
      color: "#22c55e",
    },
    {
      icon: <DollarSign size={16} />,
      label: "Total Profit",
      value: status ? `$${status.totalProfitUSD.toFixed(2)}` : "—",
      color: "var(--accent-2)",
    },
    {
      icon: <Clock size={16} />,
      label: "Last Action",
      value: status?.lastActionAt ? timeAgo(status.lastActionAt) : "—",
      color: "var(--muted)",
    },
    {
      icon: <Shield size={16} />,
      label: "Agent ID",
      value: status?.agentId ? status.agentId.slice(0, 14) + "…" : "—",
      color: "var(--muted)",
    },
  ];

  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Live Stats</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {stats.map((s) => (
          <div key={s.label} style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "10px 12px", borderRadius: 8,
            background: "var(--surface-2)", border: "1px solid var(--border)",
          }}>
            <div className="flex items-center gap-2">
              <span style={{ color: s.color }}>{s.icon}</span>
              <span style={{ fontSize: 13, color: "var(--muted)" }}>{s.label}</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: s.color }}>{s.value}</span>
          </div>
        ))}
      </div>

      {/* Automation status */}
      <div style={{ paddingTop: 12, borderTop: "1px solid var(--border)" }}>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
          24/7 Automation
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Chainlink watcher */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="flex items-center gap-2">
              <Radio size={13} style={{ color: automation?.chainlinkWatcher ? "#22c55e" : "var(--muted)" }} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Chainlink Watcher</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
              background: automation?.chainlinkWatcher
                ? "color-mix(in srgb, #22c55e 12%, var(--surface))"
                : "var(--surface-2)",
              border: `1px solid ${automation?.chainlinkWatcher ? "#22c55e" : "var(--border)"}`,
              color: automation?.chainlinkWatcher ? "#22c55e" : "var(--muted)",
            }}>
              {automation?.chainlinkWatcher ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Cron fallback */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="flex items-center gap-2">
              <Timer size={13} style={{ color: "#22c55e" }} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>Cron Fallback</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
              background: "color-mix(in srgb, #22c55e 12%, var(--surface))",
              border: "1px solid #22c55e", color: "#22c55e",
            }}>
              {automation?.cronSchedule === "0 */6 * * *" ? "Every 6h" : automation?.cronSchedule ?? "Active"}
            </span>
          </div>

          {/* On-chain */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div className="flex items-center gap-2">
              <Shield size={13} style={{ color: automation?.onChainEnabled ? "#22c55e" : "var(--danger)" }} />
              <span style={{ fontSize: 12, color: "var(--muted)" }}>On-chain Execution</span>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 5,
              background: automation?.onChainEnabled
                ? "color-mix(in srgb, #22c55e 12%, var(--surface))"
                : "color-mix(in srgb, var(--danger) 12%, var(--surface))",
              border: `1px solid ${automation?.onChainEnabled ? "#22c55e" : "var(--danger)"}`,
              color: automation?.onChainEnabled ? "#22c55e" : "var(--danger)",
            }}>
              {automation?.onChainEnabled ? "Enabled" : "Disabled"}
            </span>
          </div>
        </div>
      </div>

      {status?.lastAction && (
        <div style={{
          padding: "10px 12px", borderRadius: 8,
          background: "var(--surface-2)", border: "1px solid var(--border)",
          borderLeft: "3px solid var(--accent-2)",
        }}>
          <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>Last action</p>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5 }}>
            {status.lastAction.length > 80 ? status.lastAction.slice(0, 80) + "…" : status.lastAction}
          </p>
        </div>
      )}
    </div>
  );
}
