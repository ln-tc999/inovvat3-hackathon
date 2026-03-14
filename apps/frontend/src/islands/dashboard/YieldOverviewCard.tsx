import { ChevronDown } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { apiClient } from "../../lib/api";
import { getProfitSnapshots, addProfitSnapshot } from "../../lib/db";

interface ChartPoint { date: string; cumYield: number; dailyAPY: number; }

function generateMockData(days = 30): ChartPoint[] {
  const pts: ChartPoint[] = [];
  let cum = 0;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    cum += 0.06 + Math.random() * 0.18;
    pts.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumYield: parseFloat(cum.toFixed(2)),
      dailyAPY: 420 + Math.floor(Math.random() * 280),
    });
  }
  return pts;
}

const MOCK_DATA = generateMockData();

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 12, padding: "10px 14px", fontSize: 12, color: "var(--text)",
    }}>
      <p style={{ color: "var(--muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ color: "var(--accent)" }}>Cumulative: ${payload[0]?.value?.toFixed(2)}</p>
      <p style={{ color: "var(--accent-2)" }}>Daily APY: {((payload[1]?.value ?? 0) / 100).toFixed(2)}%</p>
    </div>
  );
};

export default function YieldOverviewCard() {
  const [chartData, setChartData] = useState<ChartPoint[]>(MOCK_DATA);
  const [range, setRange] = useState("Last 30 Days");
  const [dropOpen, setDropOpen] = useState(false);
  const ranges = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  useEffect(() => {
    if (!status) return;
    addProfitSnapshot({ date: new Date().toISOString().slice(0, 10), profitUSD: status.totalProfitUSD, apyBps: status.currentAPY });
  }, [status?.totalProfitUSD]);

  useEffect(() => {
    getProfitSnapshots(30).then((snaps) => {
      if (snaps.length > 3) {
        setChartData(snaps.reverse().map((s) => ({
          date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          cumYield: parseFloat(s.profitUSD.toFixed(2)),
          dailyAPY: s.apyBps,
        })));
      }
    });
  }, []);

  const avgAPY = status?.currentAPY ?? 480;

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Yield Performance</p>
          <p style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginTop: 4 }}>
            {(avgAPY / 100).toFixed(1)}% Avg APY
          </p>
        </div>
        <div className="relative" style={{ flexShrink: 0 }}>
          <button
            onClick={() => setDropOpen((v) => !v)}
            className="d-btn d-btn-default"
            style={{ height: 34, fontSize: 13, padding: "0 12px" }}
            aria-haspopup="listbox"
            aria-expanded={dropOpen}
          >
            {range}
            <ChevronDown size={13} aria-hidden="true" />
          </button>
          {dropOpen && (
            <ul
              role="listbox"
              style={{
                position: "absolute", right: 0, top: "calc(100% + 4px)", zIndex: 10,
                background: "var(--surface)", border: "1px solid var(--border)",
                borderRadius: 12, minWidth: 140, overflow: "hidden", listStyle: "none",
                margin: 0, padding: 0,
              }}
            >
              {ranges.map((r) => (
                <li key={r}>
                  <button
                    role="option"
                    aria-selected={r === range}
                    onClick={() => { setRange(r); setDropOpen(false); }}
                    style={{
                      width: "100%", textAlign: "left", padding: "9px 16px",
                      fontSize: 13, color: r === range ? "var(--accent)" : "var(--muted)",
                      background: "none", border: "none", cursor: "pointer",
                      transition: "background 0.1s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "var(--surface-2)"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "none"; }}
                  >
                    {r}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div style={{ height: 180 }} role="img" aria-label="Yield performance area chart">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="gPurple" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a78bfa" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#a78bfa" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gCyan" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#5eead4" stopOpacity={0.5} />
                <stop offset="95%" stopColor="#5eead4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} interval="preserveStartEnd" />
            <YAxis tick={{ fontSize: 11, fill: "var(--muted)" }} tickLine={false} axisLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Area type="monotone" dataKey="cumYield" stroke="#a78bfa" strokeWidth={2} fill="url(#gPurple)" dot={false} activeDot={{ r: 4, fill: "#a78bfa" }} />
            <Area type="monotone" dataKey="dailyAPY"  stroke="#5eead4" strokeWidth={2} fill="url(#gCyan)"   dot={false} activeDot={{ r: 4, fill: "#5eead4" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex gap-5">
        {[["#a78bfa", "Cumulative Yield"], ["#5eead4", "Daily Earnings"]].map(([color, label]) => (
          <div key={label} className="flex items-center gap-2">
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }} aria-hidden="true" />
            <span style={{ fontSize: 12, color: "var(--muted)" }}>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
