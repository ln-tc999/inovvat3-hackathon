import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import TopNavBar from "./TopNavBar";
import PortfolioCard from "../PortfolioCard";

function PortfolioContent() {
  const { isDark, toggle } = useTheme();

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNavBar isDark={isDark} onToggle={toggle} />

      <main style={{ paddingTop: 76 }} aria-label="Portfolio main content">
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
              Portfolio
            </h1>
            <p
              style={{
                fontSize: 15,
                color: "var(--muted)",
                marginTop: 6,
                lineHeight: 1.5,
              }}
            >
              See all your active positions, APY, and yield breakdown across protocols.
            </p>
          </div>

          <div>
            <PortfolioCard />
          </div>
        </div>
      </main>
    </div>
  );
}

function PortfolioShellInner() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <PortfolioContent />
    </WagmiProvider>
  );
}

export default function PortfolioShell() {
  return <PortfolioShellInner />;
}
