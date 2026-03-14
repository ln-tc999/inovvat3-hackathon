import { useState } from "react";
import { useAccount } from "wagmi";
import { submitInstruction } from "../lib/api";

const SUGGESTIONS = [
  "Maximize yield with low risk on stablecoins only",
  "Compound every 6 hours, risk < 5%",
  "Rebalance treasury weekly, preserve principal",
];

export function AgentChat() {
  const { address, isConnected } = useAccount();
  const [instruction, setInstruction] = useState("");
  const [maxRisk, setMaxRisk] = useState(5);
  const [result, setResult] = useState<{ preview: string; reason?: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!address || !instruction.trim()) return;

    setLoading(true);
    setError(null);
    try {
      const data = await submitInstruction(address, instruction, maxRisk);
      setResult({ preview: data.preview, reason: data.decision?.reason });
    } catch {
      setError("Failed to process instruction. Check backend connection.");
    } finally {
      setLoading(false);
    }
  }

  if (!isConnected) {
    return (
      <div className="text-center py-12 text-gray-500">
        Connect your wallet to configure the agent.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => setInstruction(s)}
            className="px-3 py-1.5 text-xs rounded-full border border-dark-600 text-gray-400 hover:border-brand-500 hover:text-brand-400 transition-colors"
          >
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Tell your agent what to do... e.g. 'Maximize yield with low risk on stablecoins'"
          rows={3}
          className="w-full bg-dark-700 border border-dark-600 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-brand-500 resize-none text-sm"
        />

        <div className="flex items-center gap-4">
          <label className="text-sm text-gray-400 whitespace-nowrap">
            Max Risk: <span className="text-brand-400 font-semibold">{maxRisk}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={maxRisk}
            onChange={(e) => setMaxRisk(Number(e.target.value))}
            className="flex-1 accent-brand-500"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !instruction.trim()}
          className="w-full py-3 rounded-xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold transition-colors"
        >
          {loading ? "Processing…" : "Activate Agent"}
        </button>
      </form>

      {error && (
        <div className="p-3 rounded-lg bg-red-900/30 border border-red-700 text-red-400 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 rounded-xl bg-brand-900/20 border border-brand-600/30 space-y-1">
          <p className="text-brand-400 font-semibold text-sm">Agent activated</p>
          <p className="text-gray-300 text-sm">{result.preview}</p>
          {result.reason && (
            <p className="text-gray-500 text-xs italic">{result.reason}</p>
          )}
        </div>
      )}
    </div>
  );
}
