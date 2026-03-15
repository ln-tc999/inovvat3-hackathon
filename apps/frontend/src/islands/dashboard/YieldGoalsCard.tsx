import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { apiClient } from "../../lib/api";
import { getRiskProfile } from "../../lib/db";

function RingProgress({ pct, color, size = 60 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (Math.min(pct, 100) / 100) * circ;
  return (
    <svg width={size} height={size} aria-hidden="true" style={{ transform: "rotate(-90deg)", flexShrink: 0 }}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--border)" strokeWidth={6} />
      <circle
        cx={size / 2} cy={size / 2} r={r}
        fill="none" stroke={color} strokeWidth={6}
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray 0.8s ease" }}
      />
      <text
        x="50%" y="50%"
        dominantBaseline="middle" textAnchor="middle"
        fill="var(--text)" fontSize={11} fontWeight={700}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {Math.min(pct, 100)}%
      </text>
    </svg>
  );
}

export default function YieldGoalsCard() {
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

  const earned = status?.totalProfitUSD ?? 0;
  const totalUSD = status?.portfolio?.reduce((s, p) => s + p.amountUSD, 0) ?? 0;
  const yieldTarget = profile?.yieldTarget ?? 5;
  const timeHorizon = profile?.timeHorizon ?? "medium";

  // Derive goals from profile
  const monthlyTarget = totalUSD > 0
    ? Math.round((totalUSD * (yieldTarget / 100)) / 12)
    : 100;

  const horizonMonths = timeHorizon === "short" ? 3 : timeHorizon === "medium" ? 12 : 36;
  const horizonTarget = totalUSD > 0
    ? Math.round((totalUSD * (yieldTarget / 100)) * (horizonMonths / 12))
    : 500;

  const annualTarget = totalUSD > 0
    ? Math.round(totalUSD * (yieldTarget / 100))
    : 1000;

  const horizonLabel = timeHorizon === "short" ? "3-Month" : timeHorizon === "medium" ? "12-Month" : "3-Year";

  const goals = [
    {
      label: `Monthly (${yieldTarget}% APY)`,
      target: monthlyTarget,
      earned: Math.min(earned, monthlyTarget),
      deadline: new Date(Date.now() + 30 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      color: "var(--accent)",
    },
    {
      label: `${horizonLabel} Horizon`,
      target: horizonTarget,
      earned: Math.min(earned * 0.4, horizonTarget),
      deadline: new Date(Date.now() + horizonMonths * 30 * 86400000).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      color: "var(--accent-2)",
    },
    {
      label: `Annual Target`,
      target: annualTarget,
      earned: Math.min(earned * 0.3, annualTarget),
      deadline: new Date(Date.now() + 365 * 86400000).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      color: "var(--accent)",
    },
  ];

  return (
    <div className="d-card flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Yield Goals</p>
        {profile && (
          <span className="d-badge" style={{ fontSize: 11 }}>
            {yieldTarget}% target
          </span>
        )}
      </div>

      {totalUSD === 0 ? (
        <div style={{ textAlign: "center", padding: "16px 0" }}>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>
            Deposit funds to start tracking your yield goals.
          </p>
          <a href="/dashboard/portfolio" style={{
            display: "inline-block", marginTop: 12,
            fontSize: 13, color: "var(--accent)", textDecoration: "none",
            fontWeight: 600,
          }}>
            Go to Portfolio →
          </a>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.round((g.earned / g.target) * 100) : 0;
            return (
              <div key={g.label} className="flex items-center gap-4">
                <RingProgress pct={pct} color={g.color} size={60} />
                <div className="flex-1 min-w-0">
                  <p style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{g.label}</p>
                  <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>Deadline: {g.deadline}</p>
                  <div className="flex gap-4 mt-1">
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      Earned: <span style={{ color: g.color }}>${g.earned.toFixed(0)}</span>
                    </span>
                    <span style={{ fontSize: 12, color: "var(--muted)" }}>
                      Target: <span style={{ color: "var(--text)" }}>${g.target.toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
