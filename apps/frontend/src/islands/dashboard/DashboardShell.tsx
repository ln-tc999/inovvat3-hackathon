import { useEffect, useState } from "react";
import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getRiskProfile, isOnboardingComplete } from "../../lib/db";
import TopNavBar from "./TopNavBar";
import TotalPortfolioCard from "./TotalPortfolioCard";
import YieldOverviewCard from "./YieldOverviewCard";
import AgentControlsCard from "./AgentControlsCard";
import RiskLimitCard from "./RiskLimitCard";
import YieldGoalsCard from "./YieldGoalsCard";
import ActionHistoryCard from "./ActionHistoryCard";
import RecentActionsCard from "./RecentActionsCard";
import DepositCard from "./DepositCard";

function LoadingScreen() {
  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Loading...</p>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function DashboardContent() {
  const { isDark, toggle } = useTheme();
  const { address, isConnected } = useAccount();
  const [guardChecked, setGuardChecked] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      window.location.href = "/onboarding";
      return;
    }
    isOnboardingComplete(address).then((complete) => {
      if (!complete) window.location.href = "/onboarding";
      else setGuardChecked(true);
    });
  }, [address, isConnected]);

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address && guardChecked,
  });

  if (!guardChecked) return <LoadingScreen />;

  const greeting = profile?.userName?.trim()
    ? `Welcome back, ${profile.userName.trim()}`
    : "Dashboard";

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNavBar isDark={isDark} onToggle={toggle} />

      <main style={{ paddingTop: 76 }} aria-label="Dashboard main content">
        <div
          style={{ maxWidth: 1440, margin: "0 auto", padding: "32px" }}
          className="max-md:px-5 max-sm:px-3"
        >
          {/* Page heading */}
          <div style={{ marginBottom: 28 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              {greeting}
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--muted)",
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              Optimize your crypto yield with autonomous AI agent — set once,
              earn 24/7
            </p>
          </div>

          {/* Row 1 */}
          <div style={{ marginBottom: 24 }}>
            <TotalPortfolioCard />
          </div>

          {/* Row 2: 2/3 + 1/3 */}
          <div
            className="grid dash-grid-2 gap-6"
            style={{ gridTemplateColumns: "2fr 1fr", marginBottom: 24 }}
          >
            <YieldOverviewCard />
            <AgentControlsCard />
          </div>

          {/* Row 3: 3 equal cols */}
          <div
            className="grid dash-grid-3 gap-6"
            style={{ gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 24 }}
          >
            <RiskLimitCard />
            <YieldGoalsCard />
            <ActionHistoryCard />
          </div>

          {/* Row 4: Deposit + Recent Actions */}
          <div
            className="grid dash-grid-2 gap-6"
            style={{ gridTemplateColumns: "1fr 2fr" }}
          >
            <DepositCard />
            <RecentActionsCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function DashboardShellInner() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <DashboardContent />
    </WagmiProvider>
  );
}

export default function DashboardShell() {
  return <DashboardShellInner />;
}
