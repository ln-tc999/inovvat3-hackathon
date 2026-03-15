import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { Activity, PauseCircle, TrendingUp, Sun, Moon } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../lib/api";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

function DashboardHeaderInner() {
  const { address } = useAccount();
  const [dark, setDark] = useState(true);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const totalUSD = status?.portfolio?.reduce((s, p) => s + p.amountUSD, 0) ?? 0;
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "—";

  useEffect(() => {
    const saved = localStorage.getItem("theme");
    setDark(saved !== "light");
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-b border-slate-200 dark:border-slate-800 px-4 sm:px-6 py-3">
      <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
        {/* Brand */}
        <a href="/" className="flex items-center gap-2 shrink-0" aria-label="Go to home">
          <span className="text-cyan-400 font-bold text-lg">Vatiin</span>
          <span className="dark:text-white font-bold text-lg hidden sm:block">AI</span>
        </a>

        {/* Center stats */}
        <div className="hidden md:flex items-center gap-6 text-sm">
          <div className="text-center">
            <p className="text-slate-400 text-xs">Total Value</p>
            <p className="font-semibold text-slate-900 dark:text-white">
              ${totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">Agent</p>
            {status?.active ? (
              <span className="badge-active">
                <Activity size={10} aria-hidden="true" />
                {STRINGS.statusActive}
              </span>
            ) : (
              <span className="badge-paused">
                <PauseCircle size={10} aria-hidden="true" />
                {STRINGS.statusPaused}
              </span>
            )}
          </div>
          <div className="text-center">
            <p className="text-slate-400 text-xs">APY</p>
            <p className="font-semibold text-cyan-400">
              {status ? `${(status.currentAPY / 100).toFixed(1)}%` : "—"}
            </p>
          </div>
        </div>

        {/* Right: address + theme toggle */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg">
            {shortAddr}
          </span>
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-400 transition-colors"
            aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark ? <Sun size={16} aria-hidden="true" /> : <Moon size={16} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </header>
  );
}

export default function DashboardHeader() {
  return (
    <WagmiProvider>
      <DashboardHeaderInner />
    </WagmiProvider>
  );
}
