import { useQuery } from "@tanstack/react-query";
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
} from "recharts";
import { BarChart2, TrendingUp, Clock, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";
import { apiClient } from "../lib/api";
import { getProfitSnapshots, addProfitSnapshot } from "../lib/db";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

interface ChartPoint {
  date: string;
  profit: number;
  apy: number;
}

// Generate mock historical data for demo
function generateMockHistory(days = 14): ChartPoint[] {
  const points: ChartPoint[] = [];
  let cumProfit = 0;
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dailyProfit = 0.08 + Math.random() * 0.15;
    cumProfit += dailyProfit;
    points.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      profit: parseFloat(cumProfit.toFixed(2)),
      apy: 450 + Math.floor(Math.random() * 250),
    });
  }
  return points;
}

const MOCK_HISTORY = generateMockHistory();

function ProfitChartInner() {
  const [chartData, setChartData] = useState<ChartPoint[]>(MOCK_HISTORY);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  // Persist today's snapshot to IndexedDB
  useEffect(() => {
    if (!status) return;
    const today = new Date().toISOString().slice(0, 10);
    addProfitSnapshot({
      date: today,
      profitUSD: status.totalProfitUSD,
      apyBps: status.currentAPY,
    });
  }, [status?.totalProfitUSD]);

  // Load from IndexedDB on mount
  useEffect(() => {
    getProfitSnapshots(14).then((snaps) => {
      if (snaps.length > 2) {
        setChartData(
          snaps.reverse().map((s) => ({
            date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            profit: parseFloat(s.profitUSD.toFixed(2)),
            apy: s.apyBps,
          }))
        );
      }
    });
  }, []);

  const totalProfit = status?.totalProfitUSD ?? 0;
  const avgAPY = status?.currentAPY ?? 450;
  const lastAction = status?.lastAction ?? "—";

  return (
    <section className="space-y-4" aria-labelledby="performance-heading">
      <div className="flex items-center gap-2">
        <BarChart2 size={18} className="text-cyan-400" aria-hidden="true" />
        <h2 id="performance-heading" className="font-semibold text-slate-900 dark:text-white">
          {STRINGS.performanceSection}
        </h2>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <DollarSign size={14} aria-hidden="true" />
            Total Profit
          </div>
          <p className="text-2xl font-bold text-emerald-400">
            +${totalProfit.toFixed(4)}
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <TrendingUp size={14} aria-hidden="true" />
            Average APY
          </div>
          <p className="text-2xl font-bold text-cyan-400">
            {(avgAPY / 100).toFixed(2)}%
          </p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2 text-slate-400 text-xs mb-2">
            <Clock size={14} aria-hidden="true" />
            Last Action
          </div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 leading-snug">
            {lastAction}
          </p>
        </div>
      </div>

      {/* Line chart */}
      <div className="card">
        <p className="text-xs text-slate-400 mb-4">Cumulative Profit (USD) — 14 days</p>
        <div
          className="h-48"
          role="img"
          aria-label="Line chart showing cumulative profit over the last 14 days"
        >
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#273548" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748b" }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `$${v}`}
              />
              <Tooltip
                contentStyle={{
                  background: "#1E293B",
                  border: "1px solid #273548",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#f1f5f9",
                }}
                formatter={(value: number) => [`$${value.toFixed(4)}`, "Profit"]}
              />
              <Line
                type="monotone"
                dataKey="profit"
                stroke="#00D4FF"
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 4, fill: "#00D4FF" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </section>
  );
}

export default function ProfitChart() {
  return (
    <WagmiProvider>
      <ProfitChartInner />
    </WagmiProvider>
  );
}
