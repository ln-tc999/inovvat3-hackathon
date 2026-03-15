import { useEffect, useState, useRef } from "react";
import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import { useAccount } from "wagmi";
import { isOnboardingComplete } from "../../lib/db";
import TopNavBar from "./TopNavBar";
import AgentIdentityCard from "./agent/AgentIdentityCard";
import AgentInstructionPanel from "./agent/AgentInstructionPanel";
import AgentExecutionLog from "./agent/AgentExecutionLog";
import AgentLiveStats from "./agent/AgentLiveStats";
import AgentActionsPanel from "./agent/AgentActionsPanel";
import AgentAutoUpkeep from "./agent/AgentAutoUpkeep";

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

function AgentControlsContent() {
  const { isDark, toggle } = useTheme();
  const { address, isConnected } = useAccount();
  const [guardChecked, setGuardChecked] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) { window.location.href = "/onboarding"; return; }
    isOnboardingComplete(address).then((ok) => {
      if (!ok) window.location.href = "/onboarding";
      else setGuardChecked(true);
    });
  }, [address, isConnected]);

  if (!guardChecked) return <LoadingScreen />;

  return (
    <div style={{ background: "var(--bg)", minHeight: "100vh" }}>
      <TopNavBar isDark={isDark} onToggle={toggle} />

      <main style={{ paddingTop: 76 }} aria-label="Agent controls">
        <div style={{ maxWidth: 1440, margin: "0 auto", padding: "32px" }} className="max-md:px-5 max-sm:px-3">

          {/* Page heading */}
          <div style={{ marginBottom: 28 }}>
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0 }}>Agent Controls</h1>
            <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 6 }}>
              Configure, monitor, and control your autonomous yield agent.
            </p>
          </div>

          {/* 2-col layout: main (left) + sidebar (right) */}
          <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: 24, alignItems: "start" }}>

            {/* Left column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <AgentIdentityCard />
              <AgentInstructionPanel />
              <AgentExecutionLog />
            </div>

            {/* Right sidebar */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <AgentLiveStats />
              <AgentActionsPanel />
              <AgentAutoUpkeep />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function AgentControlsShellInner() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <AgentControlsContent />
    </WagmiProvider>
  );
}

export default function AgentControlsShell() {
  return <AgentControlsShellInner />;
}
