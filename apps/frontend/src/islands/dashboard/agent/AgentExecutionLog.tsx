import { useQuery } from "@tanstack/react-query";
import { getHistory } from "../../../lib/db";
import { Zap, MessageSquare, RefreshCw, TrendingUp, Inbox } from "lucide-react";

const ACTION_ICON: Record<string, React.ReactNode> = {
  "upkeep":          <Zap size={13} />,
  "set-instruction": <MessageSquare size={13} />,
  "rebalance":       <RefreshCw size={13} />,
  "default":         <TrendingUp size={13} />,
};

const ACTION_COLOR: Record<string, string> = {
  "upkeep":          "var(--accent-2)",
  "set-instruction": "var(--accent)",
  "rebalance":       "#a78bfa",
  "default":         "var(--muted)",
};

const ACTION_LABEL: Record<string, string> = {
  "upkeep":          "Upkeep",
  "set-instruction": "Instruction",
  "rebalance":       "Rebalance",
};

function timeAgo(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function AgentExecutionLog() {
  const { data: history, isLoading } = useQuery({
    queryKey: ["history"],
    queryFn: () => getHistory(50),
    refetchInterval: 15_000,
  });

  const isEmpty = !isLoading && (!history || history.length === 0);

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Execution Log</p>
        <span className="d-badge" style={{ fontSize: 11 }}>{history?.length ?? 0} entries</span>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: 20 }}>
          <div style={{ width: 22, height: 22, borderRadius: "50%", border: "2px solid var(--border)", borderTopColor: "var(--accent)", margin: "0 auto", animation: "spin 0.8s linear infinite" }} />
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      )}

      {isEmpty && (
        <div style={{ textAlign: "center", padding: "28px 0" }}>
          <Inbox size={28} style={{ color: "var(--muted)", margin: "0 auto 8px" }} />
          <p style={{ fontSize: 13, color: "var(--muted)" }}>No executions yet.</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Send an instruction or run upkeep to see logs here.
          </p>
        </div>
      )}

      {!isEmpty && history && (
        <div style={{ display: "flex", flexDirection: "column", maxHeight: 380, overflowY: "auto" }}>
          {history.map((entry, i) => {
            const key = entry.action in ACTION_ICON ? entry.action : "default";
            const color = ACTION_COLOR[key];
            return (
              <div
                key={entry.id ?? i}
                className="flex items-start gap-3 py-3"
                style={{ borderBottom: i < history.length - 1 ? "1px solid var(--border)" : "none" }}
              >
                {/* Icon */}
                <div style={{
                  width: 30, height: 30, borderRadius: 8, flexShrink: 0, marginTop: 1,
                  background: `color-mix(in srgb, ${color} 12%, var(--surface))`,
                  color, display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {ACTION_ICON[key]}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="flex items-center gap-2 flex-wrap" style={{ marginBottom: 3 }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: "1px 7px", borderRadius: 5,
                      background: `color-mix(in srgb, ${color} 12%, var(--surface))`,
                      border: `1px solid ${color}`, color,
                    }}>
                      {ACTION_LABEL[key] ?? key}
                    </span>
                    {entry.apyBps > 0 && (
                      <span style={{ fontSize: 11, color: "var(--muted)" }}>
                        {(entry.apyBps / 100).toFixed(1)}% APY
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: "var(--muted)", marginLeft: "auto" }}>
                      {timeAgo(entry.timestamp)}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {entry.reason}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
