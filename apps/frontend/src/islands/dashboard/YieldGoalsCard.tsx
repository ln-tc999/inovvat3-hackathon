import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";

function RingProgress({ pct, color, size = 64 }: { pct: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;
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
        fill="var(--text)" fontSize={12} fontWeight={700}
        style={{ transform: "rotate(90deg)", transformOrigin: "center" }}
      >
        {pct}%
      </text>
    </svg>
  );
}

export default function YieldGoalsCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const earned = data?.totalProfitUSD ?? 2250;

  const goals = [
    { label: "Monthly Yield 8%",    target: 3000, earned: Math.min(earned, 3000),       deadline: "Mar 31", color: "var(--accent)" },
    { label: "Quarterly Compound",  target: 500,  earned: Math.min(earned * 0.4, 500),  deadline: "Jun 30", color: "var(--accent-2)" },
    { label: "Annual APY 10%",      target: 8000, earned: Math.min(earned * 0.3, 8000), deadline: "Dec 31", color: "var(--accent)" },
  ];

  return (
    <div className="d-card flex flex-col gap-5">
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Yield Goals</p>
      <div className="flex flex-col gap-5">
        {goals.map((g) => {
          const pct = Math.round((g.earned / g.target) * 100);
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
    </div>
  );
}
