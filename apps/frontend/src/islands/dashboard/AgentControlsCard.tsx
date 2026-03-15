import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Send, Power, PowerOff, AlertTriangle, Loader2, Zap, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { apiClient } from "../../lib/api";
import { addHistoryEntry, getRiskProfile } from "../../lib/db";
import { STRINGS } from "../../lib/strings";

const schema = z.object({ instruction: z.string().min(5, "Too short").max(500) });
type FormData = z.infer<typeof schema>;
const SUGGESTIONS = [STRINGS.chatSuggestion1, STRINGS.chatSuggestion2, STRINGS.chatSuggestion3];

export default function AgentControlsCard() {
  const { address, isConnected } = useAccount();
  const qc = useQueryClient();
  const [killConfirm, setKillConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { instruction: status?.instruction ?? "" },
  });

  // Pre-fill from risk profile if no instruction set yet
  useEffect(() => {
    if (profile?.generatedInstruction && !status?.instruction) {
      setValue("instruction", profile.generatedInstruction);
    }
  }, [profile, status?.instruction]);

  const suggestions = profile
    ? [profile.generatedInstruction, STRINGS.chatSuggestion2, STRINGS.chatSuggestion3]
    : SUGGESTIONS;

  const charCount = watch("instruction")?.length ?? 0;

  const instructionMutation = useMutation({
    mutationFn: (d: FormData) => apiClient.setInstruction({ instruction: d.instruction, userAddress: address }),
    onSuccess: async (res) => {
      setSuccessMsg(res.preview);
      await addHistoryEntry({ timestamp: Date.now(), action: "set-instruction", reason: res.preview, apyBps: res.suggestedAPY, profitUSD: 0 });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
      setTimeout(() => setSuccessMsg(null), 5000);
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (active: boolean) => apiClient.pause(active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-status"] }),
  });

  const upkeepMutation = useMutation({
    mutationFn: () => apiClient.mockUpkeep(),
    onSuccess: async (res) => {
      await addHistoryEntry({ timestamp: Date.now(), action: "upkeep", reason: res.reason, apyBps: res.newAPY, profitUSD: 0 });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    },
  });

  function handleKill() {
    if (!killConfirm) { setKillConfirm(true); return; }
    pauseMutation.mutate(false);
    setKillConfirm(false);
  }

  return (
    <div className="d-card flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 14, color: "var(--muted)", fontWeight: 500 }}>AI Agent Status</p>
        <span className={`d-badge ${status?.active ? "d-badge-cyan" : "d-badge-red"}`}>
          <span style={{
            width: 6, height: 6, borderRadius: "50%",
            background: status?.active ? "var(--accent-2)" : "var(--danger)",
            display: "inline-block",
          }} aria-hidden="true" />
          {status?.active ? "Active" : "Paused"}
        </span>
      </div>

      {/* Suggestion chips */}
      {isConnected && (
        <div className="flex flex-wrap gap-2" role="group" aria-label="Instruction suggestions">
          {suggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setValue("instruction", s)}
              className="d-badge d-badge-purple"
              style={{ cursor: "pointer", fontSize: 11, transition: "opacity 0.15s" }}
              aria-label={`Use: ${s}`}
            >
              {s.length > 26 ? s.slice(0, 26) + "…" : s}
            </button>
          ))}
        </div>
      )}

      {/* Form */}
      {isConnected ? (
        <form onSubmit={handleSubmit((d) => instructionMutation.mutate(d))} noValidate>
          <div style={{ position: "relative" }}>
            <label htmlFor="agent-instruction" className="sr-only">Agent instruction</label>
            <textarea
              id="agent-instruction"
              rows={3}
              placeholder={STRINGS.chatPlaceholder}
              className="d-input"
              aria-invalid={!!errors.instruction}
              onKeyDown={(e) => {
                if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                  handleSubmit((d) => instructionMutation.mutate(d))();
              }}
              {...register("instruction")}
            />
            <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "var(--muted)" }}>
              {charCount}/500
            </span>
          </div>

          {errors.instruction && (
            <p role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <AlertTriangle size={12} aria-hidden="true" />
              {errors.instruction.message}
            </p>
          )}
          {successMsg && (
            <p role="status" style={{ fontSize: 12, color: "var(--accent-2)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
              <CheckCircle size={12} aria-hidden="true" />
              {successMsg}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-3">
            <button type="submit" disabled={instructionMutation.isPending} className="d-btn d-btn-primary" style={{ fontSize: 13, height: 38 }}>
              {instructionMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              Update
            </button>
            <button
              type="button"
              onClick={() => upkeepMutation.mutate()}
              disabled={upkeepMutation.isPending || !status?.active}
              className="d-btn d-btn-default"
              style={{ fontSize: 13, height: 38 }}
              title="Simulates Chainlink Automation"
            >
              {upkeepMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
              Run Upkeep
            </button>
          </div>
        </form>
      ) : (
        <p style={{ fontSize: 13, color: "var(--muted)" }}>Connect your wallet to configure the agent.</p>
      )}

      {/* Pause / Kill */}
      <div className="flex flex-wrap gap-2 pt-3" style={{ borderTop: "1px solid var(--border)" }}>
        <button
          type="button"
          onClick={() => pauseMutation.mutate(!status?.active)}
          disabled={pauseMutation.isPending}
          className={`d-btn ${status?.active ? "d-btn-default" : "d-btn-primary"}`}
          style={{ fontSize: 13, height: 38 }}
        >
          {pauseMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : status?.active ? <PowerOff size={14} /> : <Power size={14} />}
          {status?.active ? "Pause" : "Resume"}
        </button>
        <button type="button" onClick={handleKill} className="d-btn d-btn-danger" style={{ fontSize: 13, height: 38 }}>
          <AlertTriangle size={14} />
          {killConfirm ? "Confirm Stop" : "Kill Agent"}
        </button>
        {killConfirm && (
          <button type="button" onClick={() => setKillConfirm(false)}
            style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}>
            Cancel
          </button>
        )}
      </div>

      {status?.lastAction && (
        <p style={{ fontSize: 12, color: "var(--muted)" }}>
          Last: <span style={{ color: "var(--text)" }}>{status.lastAction}</span>
        </p>
      )}
    </div>
  );
}
