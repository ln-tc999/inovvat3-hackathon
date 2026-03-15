import { useQuery } from "@tanstack/react-query";
import { getAllTxHistory } from "../../lib/db";
import { ArrowDownLeft, ArrowUpRight, ExternalLink, Inbox } from "lucide-react";

function timeAgo(ms: number): string {
  const m = Math.floor((Date.now() - ms) / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatDate(ms: number): string {
  return new Date(ms).toLocaleString("en-US", {
    month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function TxHistoryTable() {
  const { data: txs, isLoading } = useQuery({
    queryKey: ["tx-history"],
    queryFn: () => getAllTxHistory(100),
    refetchInterval: 15_000,
  });

  const isEmpty = !isLoading && (!txs || txs.length === 0);

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>
          On-Chain Transactions
        </p>
        <span className="d-badge" style={{ fontSize: 11 }}>
          {txs?.length ?? 0} total
        </span>
      </div>

      {isLoading && (
        <div style={{ textAlign: "center", padding: "24px 0" }}>
          <div style={{
            width: 24, height: 24, borderRadius: "50%",
            border: "2px solid var(--border)", borderTopColor: "var(--accent)",
            margin: "0 auto", animation: "spin 0.8s linear infinite",
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {isEmpty && (
        <div style={{ textAlign: "center", padding: "32px 0" }}>
          <Inbox size={32} style={{ color: "var(--muted)", margin: "0 auto 10px" }} />
          <p style={{ fontSize: 14, color: "var(--muted)" }}>No transactions yet.</p>
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 4 }}>
            Deposit or withdraw to see your on-chain history here.
          </p>
        </div>
      )}

      {!isEmpty && txs && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border)" }}>
                {["Type", "Asset", "Amount", "Protocol", "Date", "Status", "Tx"].map((h) => (
                  <th key={h} style={{
                    textAlign: "left", padding: "6px 10px",
                    fontSize: 11, fontWeight: 600,
                    color: "var(--muted)", textTransform: "uppercase",
                    letterSpacing: "0.06em", whiteSpace: "nowrap",
                  }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {txs.map((tx, i) => (
                <tr
                  key={tx.id ?? i}
                  style={{
                    borderBottom: i < txs.length - 1 ? "1px solid var(--border)" : "none",
                    transition: "background 0.1s",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {/* Type */}
                  <td style={{ padding: "10px 10px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{
                        width: 26, height: 26, borderRadius: 8, flexShrink: 0,
                        background: tx.type === "deposit"
                          ? "color-mix(in srgb, #22c55e 12%, var(--surface))"
                          : "color-mix(in srgb, #f59e0b 12%, var(--surface))",
                        color: tx.type === "deposit" ? "#22c55e" : "#f59e0b",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}>
                        {tx.type === "deposit"
                          ? <ArrowDownLeft size={13} />
                          : <ArrowUpRight size={13} />
                        }
                      </div>
                      <span style={{
                        fontWeight: 600,
                        color: tx.type === "deposit" ? "#22c55e" : "#f59e0b",
                        textTransform: "capitalize",
                      }}>
                        {tx.type}
                      </span>
                    </div>
                  </td>

                  {/* Asset */}
                  <td style={{ padding: "10px 10px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 6,
                      background: "var(--surface-2)", border: "1px solid var(--border)",
                      fontSize: 12, fontWeight: 600, color: "var(--text)",
                    }}>
                      {tx.asset}
                    </span>
                  </td>

                  {/* Amount */}
                  <td style={{ padding: "10px 10px", fontWeight: 600, color: "var(--text)" }}>
                    {tx.amount.toLocaleString("en-US", { maximumFractionDigits: 4 })}
                  </td>

                  {/* Protocol */}
                  <td style={{ padding: "10px 10px", color: "var(--muted)", textTransform: "capitalize" }}>
                    {tx.protocol}
                  </td>

                  {/* Date */}
                  <td style={{ padding: "10px 10px", color: "var(--muted)", whiteSpace: "nowrap" }}>
                    <span title={formatDate(tx.timestamp)}>{timeAgo(tx.timestamp)}</span>
                  </td>

                  {/* Status */}
                  <td style={{ padding: "10px 10px" }}>
                    <span style={{
                      padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                      background: tx.status === "success"
                        ? "color-mix(in srgb, #22c55e 12%, var(--surface))"
                        : "color-mix(in srgb, var(--danger) 12%, var(--surface))",
                      color: tx.status === "success" ? "#22c55e" : "var(--danger)",
                      border: `1px solid ${tx.status === "success" ? "#22c55e" : "var(--danger)"}`,
                    }}>
                      {tx.status}
                    </span>
                  </td>

                  {/* Tx link */}
                  <td style={{ padding: "10px 10px" }}>
                    <a
                      href={`https://sepolia.basescan.org/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={tx.txHash}
                      style={{
                        color: "var(--accent)", display: "flex", alignItems: "center", gap: 4,
                        fontSize: 12, fontWeight: 500,
                      }}
                    >
                      {tx.txHash.slice(0, 6)}…{tx.txHash.slice(-4)}
                      <ExternalLink size={11} />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
