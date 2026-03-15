import { ArrowUpRight, TrendingUp, Wallet } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { apiClient } from "../../lib/api";
import { getRiskProfile } from "../../lib/db";

export default function TotalPortfolioCard() {
  const { address } = useAccount();

  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 30_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  const totalUSD    = data?.portfolio?.reduce((s, p) => s + p.amountUSD, 0) ?? 0;
  const earnedYield = data?.totalProfitUSD ?? 0;
  const apy         = data?.currentAPY ?? 0;
  const apyPct      = (apy / 100).toFixed(1);

  // Per-asset breakdown
  const usdcPos = data?.portfolio?.find((p) => p.symbol === "USDC");
  const wethPos = data?.portfolio?.find((p) => p.symbol === "WETH");

  // Goal: user's yieldTarget from profile, fallback 5%
  const monthlyGoal = profile
    ? Math.round((totalUSD * (profile.yieldTarget / 100)) / 12)
    : 100;
  const goalPct = monthlyGoal > 0
    ? Math.min(100, Math.round((earnedYield / monthlyGoal) * 100))
    : 0;

  return (
    <div className="d-card flex flex-col gap-5">
      <div>
        <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>Total Portfolio Value</p>
        <div className="flex items-end gap-3 mt-1 flex-wrap">
          <span style={{ fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
            ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
          {apy > 0 && (
            <span className="d-badge d-badge-cyan" style={{ marginBottom: 4 }}>
              <ArrowUpRight size={12} />
              {apyPct}% APY
            </span>
          )}
          {totalUSD === 0 && (
            <span className="d-badge" style={{ marginBottom: 4, fontSize: 11 }}>
              No positions yet
            </span>
          )}
        </div>
      </div>

      <div className="flex gap-3 flex-wrap">
        <a href="/dashboard/portfolio" className="d-btn d-btn-default" style={{ fontSize: 14, textDecoration: "none" }}>
          <TrendingUp size={15} />
          Deposit
        </a>
        <a href="/dashboard/portfolio" className="d-btn d-btn-primary" style={{ fontSize: 14, textDecoration: "none" }}>
          Withdraw
        </a>
      </div>

      <div className="flex gap-8 flex-wrap">
        {usdcPos ? (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>USDC Position</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
              ${usdcPos.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>USDC Position</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--muted)", marginTop: 2 }}>—</p>
          </div>
        )}
        {wethPos ? (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>WETH Position</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
              ${wethPos.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </p>
          </div>
        ) : null}
        <div>
          <p style={{ fontSize: 13, color: "var(--muted)" }}>Earned Yield</p>
          <p style={{ fontSize: 16, fontWeight: 600, color: earnedYield > 0 ? "var(--accent-2)" : "var(--muted)", marginTop: 2 }}>
            {earnedYield > 0 ? `+$${earnedYield.toLocaleString("en-US", { minimumFractionDigits: 2 })}` : "—"}
          </p>
        </div>
        {profile && (
          <div>
            <p style={{ fontSize: 13, color: "var(--muted)" }}>Daily Limit</p>
            <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>
              ${profile.dailyLimitUSD.toLocaleString()}
            </p>
          </div>
        )}
      </div>

      {/* Monthly goal progress */}
      <div>
        <div className="d-progress-track">
          <div className="d-progress-fill-purple" style={{ width: `${goalPct}%` }} />
        </div>
        <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 6 }}>
          {profile
            ? `Monthly yield goal (${profile.yieldTarget}% APY target) — ${goalPct}% reached`
            : "Set up your profile to track yield goals"
          }
        </p>
      </div>
    </div>
  );
}
