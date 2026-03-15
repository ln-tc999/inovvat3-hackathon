import { useQuery } from "@tanstack/react-query";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { apiClient, type PortfolioPosition } from "../lib/api";
import { WagmiProvider } from "../components/WagmiProvider";
import { useTheme } from "../lib/useTheme";

const PROTOCOL_COLORS: Record<string, string> = {
  Aave:   "var(--accent)",
  Morpho: "#818cf8",
};

function PortfolioTable({ positions }: { positions: PortfolioPosition[] }) {
  if (positions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "32px 0" }}>
        <AlertCircle size={28} style={{ color: "var(--muted)", margin: "0 auto 10px" }} />
        <p style={{ fontSize: 14, color: "var(--muted)" }}>No active positions.</p>
        <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
          Deposit USDC or WETH to start earning yield.
        </p>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto", margin: "0 -4px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }} role="table" aria-label="Portfolio positions">
        <thead>
          <tr>
            {["Asset", "Amount", "APY", "Protocol", "Yield Today"].map((h) => (
              <th key={h} scope="col" style={{
                padding: "8px 12px", textAlign: "left",
                fontSize: 11, fontWeight: 600, color: "var(--muted)",
                textTransform: "uppercase", letterSpacing: "0.06em",
                borderBottom: "1px solid var(--border)",
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {positions.map((pos, i) => (
            <tr key={i} style={{ borderBottom: i < positions.length - 1 ? "1px solid var(--border)" : "none" }}>
              <td style={{ padding: "14px 12px" }}>
                <p style={{ fontWeight: 600, color: "var(--text)" }}>{pos.symbol}</p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2, fontFamily: "monospace" }}>
                  {pos.asset.slice(0, 6)}…{pos.asset.slice(-4)}
                </p>
              </td>
              <td style={{ padding: "14px 12px" }}>
                <p style={{ color: "var(--text)", fontWeight: 500 }}>
                  {pos.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
                <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 2 }}>
                  ${pos.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                </p>
              </td>
              <td style={{ padding: "14px 12px" }}>
                <span style={{ color: "var(--accent-2)", fontWeight: 600 }}>
                  {(pos.apy / 100).toFixed(2)}%
                </span>
              </td>
              <td style={{ padding: "14px 12px" }}>
                <span style={{
                  display: "inline-flex", alignItems: "center",
                  padding: "3px 10px", borderRadius: 9999,
                  fontSize: 11, fontWeight: 500,
                  border: `1px solid ${PROTOCOL_COLORS[pos.protocol] ?? "var(--border)"}`,
                  color: PROTOCOL_COLORS[pos.protocol] ?? "var(--muted)",
                  background: "var(--surface-2)",
                }}>
                  {pos.protocol}
                </span>
              </td>
              <td style={{ padding: "14px 12px" }}>
                <span style={{ color: "#22c55e", fontWeight: 600 }}>
                  +${pos.yieldEarnedToday.toFixed(4)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function PortfolioCardInner() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  return (
    <div className="d-card" style={{ height: "100%" }}>
      <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
        <div className="flex items-center gap-2">
          <TrendingUp size={16} style={{ color: "var(--accent)" }} />
          <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Current Positions</p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="d-btn d-btn-default"
          style={{ height: 32, padding: "0 10px", fontSize: 12 }}
          aria-label="Refresh portfolio"
        >
          <RefreshCw size={13} className={isFetching ? "animate-spin" : ""} />
          Refresh
        </button>
      </div>

      {isLoading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[1, 2].map((i) => (
            <div key={i} style={{
              height: 56, borderRadius: 10,
              background: "var(--surface-2)",
              animation: "pulse 1.5s ease-in-out infinite",
            }} />
          ))}
        </div>
      ) : isError ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, color: "var(--danger)", fontSize: 13, padding: "16px 0" }}>
          <AlertCircle size={16} />
          Failed to fetch portfolio data.
        </div>
      ) : (
        <PortfolioTable positions={data?.portfolio ?? []} />
      )}

      <style>{`@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }`}</style>
    </div>
  );
}

export default function PortfolioCard() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <PortfolioCardInner />
    </WagmiProvider>
  );
}
