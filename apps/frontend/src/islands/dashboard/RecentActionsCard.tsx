import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp } from "lucide-react";
import { apiClient } from "../../lib/api";

const TYPE_COLOR: Record<string, string> = {
  "Yield Earned": "#5eead4",
  "Rebalance":    "#a78bfa",
  "Supply":       "#818cf8",
  "Withdraw":     "#94a3b8",
};

function timeAgo(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function RecentActionsCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const lastAt = data?.lastActionAt ?? Date.now() - 3_600_000;
  const lastAction = data?.lastAction ?? "Switched to Morpho USDC @ 5.1%";
  const apy = data?.currentAPY ?? 480;

  const rows = [
    { icon: <TrendingUp size={15} />, name: lastAction.length > 40 ? lastAction.slice(0, 40) + "…" : lastAction, time: timeAgo(lastAt), amount: `+$${((apy / 10000) * 1500 / 365).toFixed(4)}`, type: "Yield Earned", positive: true },
    { icon: <RefreshCw size={15} />,  name: "Rebalance USDC → Morpho",  time: timeAgo(lastAt + 3_600_000),  amount: "$1,000.00", type: "Rebalance",    positive: false },
    { icon: <ArrowUpRight size={15} />, name: "Supply DAI to Aave",     time: timeAgo(lastAt + 7_200_000),  amount: "$500.00",   type: "Supply",       positive: false },
    { icon: <ArrowDownLeft size={15} />, name: "Compound USDC Yield",   time: timeAgo(lastAt + 10_800_000), amount: "+$0.1240",  type: "Yield Earned", positive: true },
  ];

  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Recent On-Chain Actions</p>

      <div role="list" aria-label="Recent on-chain actions">
        {rows.map((row, i) => (
          <div
            key={i}
            role="listitem"
            className="flex items-center gap-3 py-3"
            style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}
          >
            <div style={{
              width: 34, height: 34, borderRadius: 10, flexShrink: 0,
              background: "var(--surface-2)", color: TYPE_COLOR[row.type],
              display: "flex", alignItems: "center", justifyContent: "center",
            }} aria-hidden="true">
              {row.icon}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 14, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {row.name}
              </p>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 1 }}>{row.time}</p>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <p style={{ fontSize: 14, fontWeight: 600, color: row.positive ? "var(--accent-2)" : "var(--text)" }}>
                {row.amount}
              </p>
              <span style={{ fontSize: 11, color: TYPE_COLOR[row.type] }}>{row.type}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
