/**
 * WalletConnect island — thin wrapper around RainbowKit ConnectButton.
 * Keeps the variant API (hero / header) so call-sites don't change.
 * RainbowKit handles: modal, connectors, wrong-network, disconnect.
 */
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { WagmiProvider } from "../components/WagmiProvider";
import { useTheme } from "../lib/useTheme";

interface Props {
  variant?: "hero" | "header";
  redirectToDashboard?: boolean;
}

function WalletConnectInner({ variant = "header" }: Props) {
  return (
    <ConnectButton
      label={variant === "hero" ? "Connect Wallet & Start Earning" : "Connect Wallet"}
      showBalance={false}
      chainStatus="none"
      accountStatus="avatar"
    />
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
