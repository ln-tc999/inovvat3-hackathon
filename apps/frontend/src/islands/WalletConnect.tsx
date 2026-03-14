/**
 * WalletConnect island — thin wrapper around RainbowKit ConnectButton.
 * Keeps the variant API (hero / header) so call-sites don't change.
 * RainbowKit handles: modal, connectors, wrong-network, disconnect.
 */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useAccount } from "wagmi";
import { LayoutDashboard } from "lucide-react";
import { WagmiProvider } from "../components/WagmiProvider";
import { useTheme } from "../lib/useTheme";

interface Props {
  variant?: "hero" | "header";
  redirectToDashboard?: boolean;
}

function WalletConnectInner({ variant = "header", redirectToDashboard = false }: Props) {
  const { isConnected } = useAccount();

  // Redirect to dashboard once connected (hero CTA behaviour)
  if (isConnected && variant === "hero" && redirectToDashboard) {
    if (typeof window !== "undefined") window.location.href = "/dashboard";
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      {/* Show dashboard link when connected */}
      {isConnected && (
        <a
          href="/dashboard"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 hover:-translate-y-0.5"
          style={{ background: "transparent", color: "var(--muted)", border: "1px solid var(--border)" }}
        >
          <LayoutDashboard size={15} />
          Dashboard
        </a>
      )}

      <ConnectButton
        label={variant === "hero" ? "Connect Wallet & Start Earning" : "Connect Wallet"}
        showBalance={false}
        chainStatus="none"
        accountStatus="avatar"
      />
    </div>
  );
}

export default function WalletConnect(props: Props) {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <WalletConnectInner {...props} />
    </WagmiProvider>
  );
}
