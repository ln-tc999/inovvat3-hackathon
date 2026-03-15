import { useEffect, useState } from "react";
import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import { useAccount } from "wagmi";
import { isOnboardingComplete } from "../../lib/db";
import TopNavBar from "./TopNavBar";
import ActionHistoryCard from "./ActionHistoryCard";
import RecentActionsCard from "./RecentActionsCard";
import HistoryStatsCard from "./HistoryStatsCard";

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

function HistoryContent() {
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

  if (!guardChecked) return <LoadingScreen />;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNavBar isDark={isDark} onToggle={toggle} />

      <main style={{ paddingTop: 76 }} aria-label="History main content">
        <div
          style={{ maxWidth: 1440, margin: "0 auto", padding: "32px" }}
          className="max-md:px-5 max-sm:px-3"
        >
          <div style={{ marginBottom: 24 }}>
            <h1
              style={{
                fontSize: 28,
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.2,
                margin: 0,
              }}
            >
              History
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--muted)",
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              Review what your agent has done over time and how actions are
              distributed.
            </p>
          </div>

          {/* Main history table + distribution donut, tuned proportions */}
          <div
            className="grid dash-grid-2 gap-6"
            style={{ gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)" }}
          >
            <RecentActionsCard />
            <ActionHistoryCard />
          </div>

          {/* Compact stats row to keep page dense and consistent with dashboard */}
          <div style={{ marginTop: 24 }}>
            <HistoryStatsCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function HistoryShellInner() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <HistoryContent />
    </WagmiProvider>
  );
}

export default function HistoryShell() {
  return <HistoryShellInner />;
}
