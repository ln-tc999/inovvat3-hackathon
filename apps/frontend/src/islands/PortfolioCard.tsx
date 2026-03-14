import { useQuery } from "@tanstack/react-query";
import { TrendingUp, RefreshCw, AlertCircle } from "lucide-react";
import { apiClient, type PortfolioPosition } from "../lib/api";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

const PROTOCOL_COLORS: Record<string, string> = {
  Aave:   "text-purple-400 bg-purple-900/20 border-purple-800",
  Morpho: "text-blue-400 bg-blue-900/20 border-blue-800",
};

function PortfolioTable({ positions }: { positions: PortfolioPosition[] }) {
  if (positions.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500">
        <AlertCircle size={32} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
        <p>No active positions. Set an instruction to start earning.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto -mx-5">
      <table className="w-full text-sm" role="table" aria-label="Portfolio positions">
        <thead>
          <tr className="border-b border-slate-200 dark:border-slate-700">
            {["Asset", "Amount", "APY", "Protocol", "Yield Today"].map((h) => (
              <th
                key={h}
                scope="col"
                className="px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700/50">
          {positions.map((pos, i) => (
            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
              <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                <div>
                  <p className="font-semibold">{pos.symbol}</p>
                  <p className="text-xs text-slate-400">{pos.asset}</p>
                </div>
              </td>
              <td className="px-5 py-4 text-slate-700 dark:text-slate-300">
                <div>
                  <p>{pos.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}</p>
                  <p className="text-xs text-slate-400">
                    ${pos.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </td>
              <td className="px-5 py-4">
                <span className="text-cyan-400 font-semibold">
                  {(pos.apy / 100).toFixed(2)}%
                </span>
              </td>
              <td className="px-5 py-4">
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PROTOCOL_COLORS[pos.protocol] ?? ""}`}
                >
                  {pos.protocol}
                </span>
              </td>
              <td className="px-5 py-4 text-emerald-400 font-medium">
                +${pos.yieldEarnedToday.toFixed(4)}
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
    <section className="card" aria-labelledby="portfolio-heading">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <TrendingUp size={18} className="text-cyan-400" aria-hidden="true" />
          <h2 id="portfolio-heading" className="font-semibold text-slate-900 dark:text-white">
            {STRINGS.portfolioSection}
          </h2>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isFetching}
          className="btn-fill-up d-badge"
          style={{ cursor: "pointer", padding: "6px 8px" }}
          aria-label="Refresh portfolio"
        >
          <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} aria-hidden="true" />
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3" aria-label="Loading portfolio" aria-busy="true">
          {[1, 2].map((i) => (
            <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : isError ? (
        <div className="flex items-center gap-2 text-red-400 text-sm py-4">
          <AlertCircle size={16} aria-hidden="true" />
          {STRINGS.errorFetch}
        </div>
      ) : (
        <PortfolioTable positions={data?.portfolio ?? []} />
      )}
    </section>
  );
}

export default function PortfolioCard() {
  return (
    <WagmiProvider>
      <PortfolioCardInner />
    </WagmiProvider>
  );
}
