import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ACTION_DATA = [
  { name: "Compound",  value: 42, color: "#a78bfa" },
  { name: "Rebalance", value: 28, color: "#5eead4" },
  { name: "Supply",    value: 20, color: "#818cf8" },
  { name: "Withdraw",  value: 10, color: "#94a3b8" },
];
const TOTAL = ACTION_DATA.reduce((s, d) => s + d.value, 0);

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
      <p style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: "var(--muted)" }}>{d.value} ({Math.round((d.value / TOTAL) * 100)}%)</p>
    </div>
  );
};

export default function ActionHistoryCard() {
  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Agent Actions</p>

      <div className="flex items-center gap-5">
        <div style={{ width: 110, height: 110, position: "relative", flexShrink: 0 }}
          role="img" aria-label="Donut chart of agent action types">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={ACTION_DATA} cx="50%" cy="50%" innerRadius={32} outerRadius={50}
                paddingAngle={3} dataKey="value" startAngle={90} endAngle={-270}>
                {ACTION_DATA.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{
            position: "absolute", inset: 0, display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center", pointerEvents: "none",
          }}>
            <span style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>{TOTAL}</span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>actions</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {ACTION_DATA.map((d) => (
            <div key={d.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: d.color, display: "inline-block", flexShrink: 0 }} aria-hidden="true" />
                <span style={{ fontSize: 13, color: "var(--muted)" }}>{d.name}</span>
              </div>
              <span style={{ fontSize: 13, color: "var(--text)", fontWeight: 500 }}>{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
