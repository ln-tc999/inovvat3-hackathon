import { useQuery } from "@tanstack/react-query";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { getHistory, getAllTxHistory } from "../../lib/db";
import { apiClient } from "../../lib/api";

const COLORS = {
  upkeep:            "#5eead4",
  "set-instruction": "#ff4800",
  rebalance:         "#a78bfa",
  supply:            "#818cf8",
  deposit:           "#22c55e",
  withdraw:          "#f59e0b",
};

const LABELS: Record<string, string> = {
  upkeep:            "Upkeep",
  "set-instruction": "Instruction",
  rebalance:         "Rebalance",
  supply:            "Supply",
  deposit:           "Deposit",
  withdraw:          "Withdraw",
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, padding: "8px 12px", fontSize: 12,
    }}>
      <p style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: "var(--muted)" }}>{d.value} actions</p>
    </div>
  );
};

export default function ActionHistoryCard() {
  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: () => getHistory(50),
    refetchInterval: 15_000,
  });

  const { data: txHistory } = useQuery({
    queryKey: ["tx-history"],
    queryFn: () => getAllTxHistory(50),
    refetchInterval: 15_000,
  });

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  // Count by action type — merge agent history + on-chain txs
  const counts: Record<string, number> = {};
  (history ?? []).forEach((h) => {
    const key = h.action in LABELS ? h.action : "upkeep";
    counts[key] = (counts[key] ?? 0) + 1;
  });
  (txHistory ?? []).forEach((tx) => {
    counts[tx.type] = (counts[tx.type] ?? 0) + 1;
  });

  const chartData = Object.entries(counts).map(([key, value]) => ({
    name: LABELS[key] ?? key,
    value,
    color: COLORS[key as keyof typeof COLORS] ?? "var(--muted)",
  }));

  // Fallback if no history
  const hasData = chartData.length > 0;
  const displayData = hasData ? chartData : [
    { name: "No data", value: 1, color: "var(--border)" },
  ];

  const total = chartData.reduce((s, d) => s + d.value, 0);
  const mostUsed = chartData.sort((a, b) => b.value - a.value)[0];

  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Agent Actions</p>

      <div className="flex items-center gap-5">
        <div style={{ width: 110, height: 110, position: "relative", flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={displayData}
                cx="50%" cy="50%"
                innerRadius={32} outerRadius={50}
                paddingAngle={hasData ? 3 : 0}
                dataKey="value"
                startAngle={90} endAngle={-270}
              >
                {displayData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
              {hasData && <Tooltip content={<CustomTooltip />} />}
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: "absolute", inset: 0,
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            pointerEvents: "none",
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{total}</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>actions</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {hasData ? chartData.map((d) => {
            const pct = Math.round((d.value / total) * 100);
            return (
              <div key={d.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block", flexShrink: 0 }} />
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>{d.name}</span>
                  </div>
                  <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{d.value}</span>
                </div>
                <div className="d-progress-track" style={{ height: 3 }}>
                  <div style={{ height: "100%", width: `${pct}%`, background: d.color, borderRadius: 9999 }} />
                </div>
              </div>
            );
          }) : (
            <p style={{ fontSize: 13, color: "var(--muted)" }}>No actions recorded yet.</p>
          )}
        </div>
      </div>

      <div style={{ fontSize: 11, color: "var(--muted)", display: "flex", justifyContent: "space-between" }}>
        <span>{mostUsed ? `Most frequent: ${mostUsed.name} (${Math.round((mostUsed.value / total) * 100)}%)` : "No data yet"}</span>
        <span>Last {Math.min(total, 50)} actions</span>
      </div>

      {status?.lastAction && (
        <div style={{ paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)" }}>Last action</p>
          <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, marginTop: 2 }}>
            {status.lastAction.length > 60 ? status.lastAction.slice(0, 60) + "…" : status.lastAction}
          </p>
        </div>
      )}
    </div>
  );
}
