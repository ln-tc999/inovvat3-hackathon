import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Power, PowerOff, Zap, AlertTriangle, Loader2, XCircle } from "lucide-react";
import { apiClient } from "../../../lib/api";
import { addHistoryEntry } from "../../../lib/db";

export default function AgentActionsPanel() {
  const qc = useQueryClient();
  const [killConfirm, setKillConfirm] = useState(false);
  const [upkeepResult, setUpkeepResult] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const pauseMutation = useMutation({
    mutationFn: (active: boolean) => apiClient.pause(active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-status"] }),
  });

  const upkeepMutation = useMutation({
    mutationFn: () => apiClient.mockUpkeep(),
    onSuccess: async (res) => {
      setUpkeepResult(res.reason);
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "upkeep",
        reason: res.reason,
        apyBps: res.newAPY,
        profitUSD: 0,
      });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
      qc.invalidateQueries({ queryKey: ["history"] });
      setTimeout(() => setUpkeepResult(null), 6000);
    },
  });

  function handleKill() {
    if (!killConfirm) { setKillConfirm(true); return; }
    pauseMutation.mutate(false);
    setKillConfirm(false);
  }

  return (
    <div className="d-card flex flex-col gap-4">
      <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Controls</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {/* Pause / Resume */}
        <button
          onClick={() => pauseMutation.mutate(!status?.active)}
          disabled={pauseMutation.isPending}
          className={`d-btn ${status?.active ? "d-btn-default" : "d-btn-primary"}`}
          style={{ width: "100%", justifyContent: "center" }}
        >
          {pauseMutation.isPending
            ? <Loader2 size={14} className="animate-spin" />
            : status?.active ? <PowerOff size={14} /> : <Power size={14} />
          }
          {status?.active ? "Pause Agent" : "Resume Agent"}
        </button>

        {/* Run Upkeep */}
        <button
          onClick={() => upkeepMutation.mutate()}
          disabled={upkeepMutation.isPending || !status?.active}
          className="d-btn d-btn-default"
          style={{ width: "100%", justifyContent: "center" }}
          title="Simulates Chainlink Automation trigger"
        >
          {upkeepMutation.isPending
            ? <Loader2 size={14} className="animate-spin" />
            : <Zap size={14} />
          }
          Run Upkeep
        </button>

        {/* Kill Agent */}
        <div>
          <button
            onClick={handleKill}
            className="d-btn d-btn-danger"
            style={{ width: "100%", justifyContent: "center" }}
          >
            <XCircle size={14} />
            {killConfirm ? "Confirm — Stop Agent" : "Kill Agent"}
          </button>
          {killConfirm && (
            <button
              onClick={() => setKillConfirm(false)}
              style={{ width: "100%", marginTop: 6, fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Upkeep result */}
      {upkeepResult && (
        <div style={{
          padding: "10px 12px", borderRadius: 8,
          background: "color-mix(in srgb, var(--accent-2) 8%, var(--surface))",
          border: "1px solid var(--accent-2)",
          fontSize: 13, color: "var(--text)", lineHeight: 1.5,
        }}>
          <span style={{ fontWeight: 600, color: "var(--accent-2)" }}>Upkeep result: </span>
          {upkeepResult}
        </div>
      )}

      {!status?.active && (
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Agent is paused. Resume to enable upkeep.
        </p>
      )}
    </div>
  );
}
