import { useAccount, useConnect, useDisconnect, useChainId, useSwitchChain } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { Wallet, LogOut, AlertCircle, ChevronDown, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

interface Props {
  variant?: "hero" | "header";
  redirectToDashboard?: boolean;
}

// Shared button styles — no dependency on global CSS classes
const btnPrimary =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer";
const btnSecondary =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-transparent text-white/60 hover:text-white border border-white/15 hover:border-white/30 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer";
const btnHero =
  "inline-flex items-center gap-2 px-6 py-3 rounded-lg text-base font-semibold bg-purple-600 text-white hover:bg-purple-500 transition-all duration-200 hover:-translate-y-0.5 cursor-pointer";
const btnWarn =
  "inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-transparent text-amber-400 border border-amber-600/50 hover:border-amber-400 transition-all duration-200 cursor-pointer";

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
      <button disabled className={variant === "hero" ? btnHero + " opacity-70 cursor-wait" : btnPrimary + " opacity-70 cursor-wait"}>
        <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Connecting…
      </button>
    );
  }

  if (isWrongChain) {
    return (
      <button onClick={() => switchChain({ chainId: baseSepolia.id })} className={btnWarn}>
        <AlertCircle size={16} />
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
      <div className="relative flex items-center gap-2">
        {/* Dashboard shortcut when connected */}
        <a href="/dashboard" className={btnSecondary} aria-label="Open Dashboard">
          <LayoutDashboard size={15} />
          Dashboard
        </a>
        <button
          onClick={() => setShowMenu((v) => !v)}
          className={btnPrimary}
          aria-label={`Connected as ${shortAddr}`}
          aria-expanded={showMenu}
        >
          <Wallet size={15} />
          {shortAddr}
          <ChevronDown size={13} />
        </button>
        {showMenu && (
          <div
            role="menu"
            className="absolute right-0 top-full mt-2 w-44 rounded-xl border border-white/8 py-1 z-50"
            style={{ background: "rgba(8,8,15,0.96)" }}
          >
            <button
              role="menuitem"
              onClick={() => { disconnect(); setShowMenu(false); }}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-white/40 hover:text-red-400 transition-colors rounded-md"
            >
              <LogOut size={14} />
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
      className={variant === "hero" ? btnHero : btnPrimary}
      aria-label={STRINGS.ctaConnect}
    >
      <Wallet size={variant === "hero" ? 18 : 15} />
      {variant === "hero" ? "Connect Wallet & Start Earning" : "Connect Wallet"}
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
