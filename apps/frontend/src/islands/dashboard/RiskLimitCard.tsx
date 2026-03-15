import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { getRiskProfile } from "../../lib/db";
import { apiClient } from "../../lib/api";

export default function RiskLimitCard() {
  const { address } = useAccount();

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  // Derive risk from profile (preferred) or fall back to instruction parsing
  let riskPct: number;
  let riskLabel: string;

  if (profile) {
    riskPct   = profile.maxRisk * 10;
    riskLabel = profile.riskTier === "conservative" ? "Low Risk"
              : profile.riskTier === "moderate"     ? "Moderate Risk"
              : "High Risk";
  } else {
    const instruction = status?.instruction?.toLowerCase() ?? "";
    riskPct   = /aggressive|degen|high/.test(instruction) ? 80 : /moderate/.test(instruction) ? 55 : 40;
    riskLabel = riskPct <= 40 ? "Low Risk" : riskPct <= 60 ? "Moderate Risk" : "High Risk";
  }

  const barColor = riskPct <= 40 ? "var(--accent-2)" : riskPct <= 60 ? "var(--accent)" : "var(--danger)";

  const breakdown = [
    { label: "Protocol Risk",  pct: Math.round(riskPct * 0.6), color: "var(--accent)" },
    { label: "Liquidity Risk", pct: Math.round(riskPct * 0.3), color: "var(--accent-2)" },
    { label: "Smart Contract", pct: Math.round(riskPct * 0.1), color: "var(--muted)" },
  ];

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>Agent Risk Level</p>
        {profile && (
          <span className="d-badge d-badge-purple" style={{ fontSize: 11 }}>
            {profile.agentName}
          </span>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <span style={{ fontSize: 28, fontWeight: 700, color: "var(--text)" }}>{riskPct}%</span>
          <span className="d-badge" style={{ borderColor: barColor, color: barColor }}>
            {riskLabel}
          </span>
        </div>
        <div className="d-progress-track">
          <div style={{ height: "100%", width: `${riskPct}%`, background: barColor, borderRadius: 9999, transition: "width 0.8s ease" }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
          {riskLabel} — {riskPct}% of max risk budget
          {profile && ` · Daily limit $${profile.dailyLimitUSD.toLocaleString()}`}
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {breakdown.map((item) => (
          <div key={item.label}>
            <div className="flex justify-between mb-1">
              <span style={{ fontSize: 12, color: "var(--muted)" }}>{item.label}</span>
              <span style={{ fontSize: 12, color: item.color, fontWeight: 500 }}>{item.pct}%</span>
            </div>
            <div className="d-progress-track" style={{ height: 4 }}>
              <div style={{ height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 9999 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
