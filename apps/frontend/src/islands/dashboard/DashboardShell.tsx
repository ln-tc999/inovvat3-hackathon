import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import TopNavBar from "./TopNavBar";
import TotalPortfolioCard from "./TotalPortfolioCard";
import YieldOverviewCard from "./YieldOverviewCard";
import AgentControlsCard from "./AgentControlsCard";
import RiskLimitCard from "./RiskLimitCard";
import YieldGoalsCard from "./YieldGoalsCard";
import ActionHistoryCard from "./ActionHistoryCard";
import RecentActionsCard from "./RecentActionsCard";

function DashboardContent() {
  const { isDark, toggle } = useTheme();

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
              Dashboard
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

          {/* Row 4 */}
          <RecentActionsCard />
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
