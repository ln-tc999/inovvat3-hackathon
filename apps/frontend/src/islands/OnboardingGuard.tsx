/**
 * OnboardingGuard — checks if connected wallet has completed onboarding.
 * If not, redirects to /onboarding.
 * Renders children once check passes.
 */
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { isOnboardingComplete } from "../lib/db";
import { WagmiProvider } from "../components/WagmiProvider";
import { useTheme } from "../lib/useTheme";

interface Props {
  children: React.ReactNode;
}

function GuardInner({ children }: Props) {
  const { address, isConnected } = useAccount();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isConnected || !address) {
      // Not connected — redirect to onboarding
      window.location.href = "/onboarding";
      return;
    }

    isOnboardingComplete(address).then((complete) => {
      if (!complete) {
        window.location.href = "/onboarding";
      } else {
        setChecked(true);
      }
    });
  }, [address, isConnected]);

  if (!checked) {
    return (
      <div style={{
        minHeight: "100vh", background: "var(--bg)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, borderRadius: "50%",
            border: "3px solid var(--border)", borderTopColor: "var(--accent)",
            margin: "0 auto 12px",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ fontSize: 14, color: "var(--muted)" }}>Loading...</p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return <>{children}</>;
}

export default function OnboardingGuard({ children }: Props) {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <GuardInner>{children}</GuardInner>
    </WagmiProvider>
  );
}
