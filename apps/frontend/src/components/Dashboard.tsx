import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { getAgentStatus, getPortfolio } from "../lib/api";

interface AgentStatus {
  active: boolean;
  maxRisk: number;
  sessionExpiry: string;
  dailyLimit: string;
}

interface Position {
  asset: string;
  adapter: string;
  balance: string;
  apy: number;
}

export function Dashboard() {
  const { address, isConnected } = useAccount();
  const [status, setStatus] = useState<AgentStatus | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);

  useEffect(() => {
    if (!address) return;
    getAgentStatus(address).then(setStatus);
    getPortfolio(address).then((d) => d && setPositions(d.positions ?? []));
  }, [address]);

  if (!isConnected) return null;

  const expiryDate = status?.sessionExpiry
    ? new Date(Number(status.sessionExpiry) * 1000).toLocaleDateString()
    : "—";

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Agent Status Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 space-y-3">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider">Agent Status</h3>
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${status?.active ? "bg-brand-400 animate-pulse" : "bg-gray-600"}`}
          />
          <span className="text-white font-semibold">
            {status?.active ? "Running" : status ? "Paused" : "Not configured"}
          </span>
        </div>
        {status && (
          <div className="space-y-1 text-sm text-gray-400">
            <p>Risk tier: <span className="text-white">{status.maxRisk}/10</span></p>
            <p>Session expires: <span className="text-white">{expiryDate}</span></p>
          </div>
        )}
      </div>

      {/* Portfolio Card */}
      <div className="bg-dark-800 border border-dark-600 rounded-2xl p-5 space-y-3 md:col-span-2">
        <h3 className="text-gray-400 text-xs uppercase tracking-wider">Portfolio</h3>
        {positions.length === 0 ? (
          <p className="text-gray-500 text-sm">No active positions yet.</p>
        ) : (
          <div className="space-y-2">
            {positions.map((pos, i) => (
              <div key={i} className="flex justify-between items-center text-sm">
                <span className="text-gray-300 font-mono">
                  {pos.asset.slice(0, 6)}…{pos.asset.slice(-4)}
                </span>
                <span className="text-white">{(Number(pos.balance) / 1e6).toFixed(2)} USDC</span>
                <span className="text-brand-400">{(pos.apy / 100).toFixed(2)}% APY</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Kill Switch */}
      {status?.active && (
        <div className="md:col-span-3 flex justify-end">
          <button className="px-4 py-2 text-sm rounded-lg border border-red-700 text-red-400 hover:bg-red-900/20 transition-colors">
            Pause Agent (Kill Switch)
          </button>
        </div>
      )}
    </div>
  );
}
