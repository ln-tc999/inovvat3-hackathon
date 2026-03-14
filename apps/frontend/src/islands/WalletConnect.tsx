import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Wallet, LogOut, AlertCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

interface Props {
  variant?: "hero" | "header";
  redirectToDashboard?: boolean;
}

function WalletConnectInner({ variant = "header", redirectToDashboard = false }: Props) {
  const { address, isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const chainId = useChainId();
  const { switchChain } = useSwitchChain();
  const [showMenu, setShowMenu] = useState(false);

  const isWrongChain = isConnected && chainId !== baseSepolia.id;
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  if (isConnecting) {
    return (
      <button
        disabled
        className={variant === "hero" ? "btn-primary opacity-70 cursor-wait" : "btn-secondary opacity-70 cursor-wait"}
        aria-label={STRINGS.connecting}
        aria-busy="true"
      >
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden="true" />
        {STRINGS.connecting}
      </button>
    );
  }

  if (isWrongChain) {
    return (
      <button
        onClick={() => switchChain({ chainId: baseSepolia.id })}
        className="btn-secondary border-amber-600 text-amber-400 hover:border-amber-400"
        aria-label="Switch to Base Sepolia network"
      >
        <AlertCircle size={16} aria-hidden="true" />
        Switch to Base
      </button>
    );
  }

  if (isConnected && address) {
    if (variant === "hero" && redirectToDashboard) {
      window.location.href = "/dashboard";
      return null;
    }
    return (
      <div className="relative">
        <button
          onClick={() => setShowMenu((v) => !v)}
          className="btn-secondary"
          aria-label={`Connected as ${shortAddr}`}
          aria-expanded={showMenu}
          aria-haspopup="true"
        >
          <Wallet size={16} aria-hidden="true" />
          {shortAddr}
          <ChevronDown size={14} aria-hidden="true" />
        </button>
        {showMenu && (
          <div
            role="menu"
            className="absolute right-0 mt-2 w-44 card shadow-lg z-50 py-1"
          >
            <button
              role="menuitem"
              onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
            >
              <LogOut size={14} aria-hidden="true" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      className={variant === "hero" ? "btn-primary text-base px-8 py-3" : "btn-primary"}
      aria-label={STRINGS.ctaConnect}
    >
      <Wallet size={variant === "hero" ? 20 : 16} aria-hidden="true" />
      {variant === "hero" ? STRINGS.ctaConnect : "Connect Wallet"}
    </button>
  );
}

export default function WalletConnect(props: Props) {
  return (
    <WagmiProvider>
      <WalletConnectInner {...props} />
    </WagmiProvider>
  );
}
