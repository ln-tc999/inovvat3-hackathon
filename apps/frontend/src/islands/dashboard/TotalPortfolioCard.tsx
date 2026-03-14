import { ArrowUpRight, TrendingUp } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../../lib/api";

export default function TotalPortfolioCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const totalUSD  = data?.portfolio?.reduce((s, p) => s + p.amountUSD, 0) ?? 12450;
  const earnedYield = data?.totalProfitUSD ?? 2250;
  const usdcBalance = data?.portfolio?.find((p) => p.symbol === "USDC")?.amountUSD ?? 10200;
  const apy = data?.currentAPY ?? 480;
  const apyPct = (apy / 100).toFixed(1);
  const goalPct = Math.min(100, Math.round((earnedYield / 3000) * 100));

  return (
    <div className="d-card flex flex-col gap-5">
      <div>
        <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>Total Portfolio Value</p>
        <div className="flex items-end gap-3 mt-1 flex-wrap">
          <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
            ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDC
          </span>
          <span className="d-badge d-badge-cyan" style={{ marginBottom: 4 }}>
            <ArrowUpRight size={12} aria-hidden="true" />
            {apyPct}% APY
          </span>
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button className="d-btn d-btn-default" style={{ fontSize: 14 }}>
          <TrendingUp size={15} aria-hidden="true" />
          Deposit Stablecoins
        </button>
        <button className="d-btn d-btn-primary" style={{ fontSize: 14 }}>
          Withdraw
        </button>
      </div>

      <div className="flex gap-8 flex-wrap">
        <div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>USDC Balance</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
            ${usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Earned Yield</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: "var(--accent-2)", marginTop: 2 }}>
            +${earnedYield.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div>
        <div className="d-progress-track">
          <div className="d-progress-fill-purple" style={{ width: `${goalPct}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
          Yield earned this month — {goalPct}% of monthly goal
        </p>
      </div>
    </div>
  );
}
