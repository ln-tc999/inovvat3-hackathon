import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const ACTION_DATA = [
  { name: "Compound", value: 42, color: "#a78bfa" },
  { name: "Rebalance", value: 28, color: "#5eead4" },
  { name: "Supply", value: 20, color: "#818cf8" },
  { name: "Withdraw", value: 10, color: "#94a3b8" },
];
const TOTAL = ACTION_DATA.reduce((s, d) => s + d.value, 0);

const HIGHLIGHTS = [
  {
    label: "Last action",
    value: "Compound on Aave v3",
    meta: "5 min ago",
  },
  {
    label: "Largest move",
    value: "Rebalance to Morpho Blue",
    meta: "$2.4k notional",
  },
  {
    label: "Most used pool",
    value: "USDC base pool",
    meta: "68% of cycles",
  },
];

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12,
      }}
    >
      <p style={{ color: d.payload.color, fontWeight: 600 }}>{d.name}</p>
      <p style={{ color: "var(--muted)" }}>
        {d.value} ({Math.round((d.value / TOTAL) * 100)}%)
      </p>
    </div>
  );
};

export default function ActionHistoryCard() {
  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
        Agent Actions
      </p>

      <div className="flex items-center gap-5">
        <div
          style={{
            width: 110,
            height: 110,
            position: "relative",
            flexShrink: 0,
          }}
          role="img"
          aria-label="Donut chart of agent action types"
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={ACTION_DATA}
                cx="50%"
                cy="50%"
                innerRadius={32}
                outerRadius={50}
                paddingAngle={3}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                {ACTION_DATA.map((e) => (
                  <Cell key={e.name} fill={e.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
            }}
          >
            <span
              style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}
            >
              {TOTAL}
            </span>
            <span style={{ fontSize: 10, color: "var(--muted)" }}>actions</span>
          </div>
        </div>

        <div className="flex flex-col gap-2 flex-1">
          {ACTION_DATA.map((d) => {
            const pct = Math.round((d.value / TOTAL) * 100);
            return (
              <div key={d.name} className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        background: d.color,
                        display: "inline-block",
                        flexShrink: 0,
                      }}
                      aria-hidden="true"
                    />
                    <span style={{ fontSize: 13, color: "var(--muted)" }}>
                      {d.name}
                    </span>
                  </div>
                  <span
                    style={{
                      fontSize: 13,
                      color: "var(--text)",
                      fontWeight: 500,
                    }}
                  >
                    {d.value}
                  </span>
                </div>
                <div className="d-progress-track" style={{ height: 3 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${pct}%`,
                      background: d.color,
                      borderRadius: 9999,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div
        className="flex items-center justify-between mt-1"
        style={{ fontSize: 11, color: "var(--muted)" }}
      >
        <span>
          Most frequent: Compound (
          {Math.round((ACTION_DATA[0].value / TOTAL) * 100)}%)
        </span>
        <span>Window: last 30 actions</span>
      </div>

      <div
        style={{
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid var(--border)",
        }}
        className="flex flex-col gap-2"
      >
        {HIGHLIGHTS.map((h) => (
          <div
            key={h.label}
            className="flex items-center justify-between gap-3"
          >
            <div className="flex flex-col min-w-0">
              <span
                style={{
                  fontSize: 11,
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "var(--muted)",
                }}
              >
                {h.label}
              </span>
              <span
                style={{
                  fontSize: 13,
                  color: "var(--text)",
                  fontWeight: 500,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {h.value}
              </span>
            </div>
            <span
              style={{
                fontSize: 11,
                color: "var(--muted)",
                whiteSpace: "nowrap",
              }}
            >
              {h.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
