import { useQuery } from "@tanstack/react-query";
import { ArrowUpRight, ArrowDownLeft, RefreshCw, TrendingUp, Zap, MessageSquare, ExternalLink } from "lucide-react";
import { apiClient } from "../../lib/api";
import { getHistory, getAllTxHistory } from "../../lib/db";
import { useAccount } from "wagmi";

const ACTION_ICON: Record<string, JSX.Element> = {
  "upkeep":          <Zap size={15} />,
  "set-instruction": <MessageSquare size={15} />,
  "rebalance":       <RefreshCw size={15} />,
  "supply":          <ArrowUpRight size={15} />,
  "deposit":         <ArrowDownLeft size={15} />,
  "withdraw":        <ArrowUpRight size={15} />,
  "default":         <TrendingUp size={15} />,
};

const ACTION_COLOR: Record<string, string> = {
  "upkeep":          "var(--accent-2)",
  "set-instruction": "var(--accent)",
  "rebalance":       "#a78bfa",
  "supply":          "#818cf8",
  "deposit":         "#22c55e",
  "withdraw":        "#f59e0b",
  "default":         "var(--muted)",
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
  const { address } = useAccount();

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: () => getHistory(8),
    refetchInterval: 15_000,
  });

  const { data: txHistory } = useQuery({
    queryKey: ["tx-history"],
    queryFn: () => getAllTxHistory(20),
    refetchInterval: 15_000,
  });

  // Merge: on-chain txs + agent history + backend status
  const rows = (() => {
    const items: {
      icon: JSX.Element;
      name: string;
      time: string;
      badge: string;
      color: string;
      txHash?: string;
    }[] = [];

    // On-chain transactions (highest priority)
    (txHistory ?? []).slice(0, 5).forEach((tx) => {
      items.push({
        icon: ACTION_ICON[tx.type],
        name: `${tx.type === "deposit" ? "Deposited" : "Withdrew"} ${tx.amount} ${tx.asset} via ${tx.protocol.toUpperCase()}`,
        time: timeAgo(tx.timestamp),
        badge: tx.type === "deposit" ? "On-chain" : "On-chain",
        color: ACTION_COLOR[tx.type],
        txHash: tx.txHash,
      });
    });

    // Latest from backend state
    if (status?.lastAction) {
      items.push({
        icon: ACTION_ICON["upkeep"],
        name: status.lastAction.length > 48 ? status.lastAction.slice(0, 48) + "…" : status.lastAction,
        time: timeAgo(status.lastActionAt),
        badge: `${(status.currentAPY / 100).toFixed(1)}% APY`,
        color: ACTION_COLOR["upkeep"],
      });
    }

    // From IndexedDB agent history
    (history ?? []).slice(0, 4).forEach((h) => {
      const key = h.action in ACTION_ICON ? h.action : "default";
      items.push({
        icon: ACTION_ICON[key] ?? ACTION_ICON["default"],
        name: h.reason.length > 48 ? h.reason.slice(0, 48) + "…" : h.reason,
        time: timeAgo(h.timestamp),
        badge: h.apyBps > 0 ? `${(h.apyBps / 100).toFixed(1)}% APY` : "",
        color: ACTION_COLOR[key] ?? ACTION_COLOR["default"],
      });
    });

    // Deduplicate
    const seen = new Set<string>();
    return items.filter((r) => {
      const key = r.name + r.time;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    }).slice(0, 8);
  })();

  const isEmpty = rows.length === 0;

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Recent Agent Actions</p>
        {status?.active && (
          <span className="d-badge d-badge-cyan" style={{ fontSize: 11 }}>
            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-2)", display: "inline-block" }} />
            Live
          </span>
        )}
      </div>

      {isEmpty ? (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <TrendingUp size={28} style={{ color: "var(--muted)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No actions yet. Activate your agent to start.</p>
        </div>
      ) : (
        <div role="list" aria-label="Recent agent actions">
          {rows.map((row, i) => (
            <div
              key={i}
              role="listitem"
              className="flex items-center gap-3 py-3"
              style={{ borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" }}
            >
              <div style={{
                width: 34, height: 34, borderRadius: 10, flexShrink: 0,
                background: "var(--surface-2)", color: row.color,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                {row.icon}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {row.name}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 1 }}>{row.time}</p>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                {row.badge && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: row.color }}>
                    {row.badge}
                  </span>
                )}
                {row.txHash && (
                  <a
                    href={`https://sepolia.basescan.org/tx/${row.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="View on BaseScan"
                    style={{ color: "var(--muted)", display: "flex", alignItems: "center" }}
                  >
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
