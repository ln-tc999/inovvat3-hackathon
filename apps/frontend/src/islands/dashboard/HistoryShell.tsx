import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import TopNavBar from "./TopNavBar";
import ActionHistoryCard from "./ActionHistoryCard";
import RecentActionsCard from "./RecentActionsCard";

function HistoryContent() {
  const { isDark, toggle } = useTheme();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNavBar isDark={isDark} onToggle={toggle} />

      <main style={{ paddingTop: 76 }} aria-label="History main content">
        <div
          style={{ maxWidth: 1440, margin: "0 auto", padding: "32px" }}
          className="max-md:px-5 max-sm:px-3"
        >
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
              Review what your agent has done over time and how actions are distributed.
            </p>
          </div>

          <div className="grid gap-6" style={{ gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)" }}>
            <ActionHistoryCard />
            <RecentActionsCard />
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
