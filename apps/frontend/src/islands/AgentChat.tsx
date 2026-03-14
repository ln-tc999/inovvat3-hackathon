import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import {
  MessageSquare, Send, Power, PowerOff, AlertTriangle,
  CheckCircle, Loader2, Zap,
} from "lucide-react";
import { useState } from "react";
import { apiClient } from "../lib/api";
import { addHistoryEntry } from "../lib/db";
import { WagmiProvider } from "../components/WagmiProvider";
import { STRINGS } from "../lib/strings";

const schema = z.object({
  instruction: z.string().min(5, "Too short — be more specific").max(500, "Max 500 characters"),
});
type FormData = z.infer<typeof schema>;

const SUGGESTIONS = [
  STRINGS.chatSuggestion1,
  STRINGS.chatSuggestion2,
  STRINGS.chatSuggestion3,
];

function AgentChatInner() {
  const { address, isConnected } = useAccount();
  const qc = useQueryClient();
  const [killConfirm, setKillConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { instruction: status?.instruction ?? "" },
  });

  const instructionValue = watch("instruction");

  const instructionMutation = useMutation({
    mutationFn: (data: FormData) =>
      apiClient.setInstruction({ instruction: data.instruction, userAddress: address }),
    onSuccess: async (res) => {
      setSuccessMsg(res.preview);
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "set-instruction",
        reason: res.preview,
        apyBps: res.suggestedAPY,
        profitUSD: 0,
      });
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
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "upkeep",
        reason: res.reason,
        apyBps: res.newAPY,
        profitUSD: 0,
      });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    },
  });

  function handleKillSwitch() {
    if (!killConfirm) {
      setKillConfirm(true);
      return;
    }
    pauseMutation.mutate(false);
    setKillConfirm(false);
  }

  if (!isConnected) {
    return (
      <div className="card text-center py-12 text-slate-500">
        <MessageSquare size={32} className="mx-auto mb-3 opacity-40" aria-hidden="true" />
        <p>Connect your wallet to configure the agent.</p>
      </div>
    );
  }

  return (
    <section className="card space-y-5" aria-labelledby="agent-controls-heading">
      <div className="flex items-center gap-2">
        <MessageSquare size={18} className="text-cyan-400" aria-hidden="true" />
        <h2 id="agent-controls-heading" className="font-semibold text-slate-900 dark:text-white">
          {STRINGS.agentControlsSection}
        </h2>
      </div>

      {/* Suggestion chips */}
      <div className="flex flex-wrap gap-2" role="group" aria-label="Instruction suggestions">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue("instruction", s)}
            className="px-3 py-1.5 text-xs rounded-full border border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-cyan-400 hover:text-cyan-400 transition-colors"
            aria-label={`Use suggestion: ${s}`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Instruction form */}
      <form onSubmit={handleSubmit((d) => instructionMutation.mutate(d))} noValidate>
        <div className="relative">
          <label htmlFor="instruction" className="sr-only">
            Agent instruction
          </label>
          <textarea
            id="instruction"
            rows={3}
            placeholder={STRINGS.chatPlaceholder}
            aria-describedby={errors.instruction ? "instruction-error" : undefined}
            aria-invalid={!!errors.instruction}
            className="input-base resize-none pr-12"
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                handleSubmit((d) => instructionMutation.mutate(d))();
              }
            }}
            {...register("instruction")}
          />
          <span className="absolute bottom-3 right-3 text-xs text-slate-500">
            {instructionValue?.length ?? 0}/500
          </span>
        </div>
        {errors.instruction && (
          <p id="instruction-error" role="alert" className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
            <AlertTriangle size={12} aria-hidden="true" />
            {errors.instruction.message}
          </p>
        )}

        {successMsg && (
          <div role="status" className="mt-2 flex items-center gap-2 text-sm text-emerald-400">
            <CheckCircle size={14} aria-hidden="true" />
            {successMsg}
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={instructionMutation.isPending}
            className="btn-primary"
            aria-label="Update agent instruction"
          >
            {instructionMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Send size={16} aria-hidden="true" />
            )}
            {STRINGS.updateInstruction}
          </button>

          {/* Trigger mock upkeep */}
          <button
            type="button"
            onClick={() => upkeepMutation.mutate()}
            disabled={upkeepMutation.isPending || !status?.active}
            className="btn-secondary"
            aria-label="Trigger mock agent upkeep cycle"
            title="Simulates Chainlink Automation trigger"
          >
            {upkeepMutation.isPending ? (
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
            ) : (
              <Zap size={16} aria-hidden="true" />
            )}
            Run Upkeep
          </button>
        </div>
      </form>

      {/* Pause / Resume toggle */}
      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => pauseMutation.mutate(!status?.active)}
          disabled={pauseMutation.isPending}
          className={status?.active ? "btn-secondary" : "btn-primary"}
          aria-label={status?.active ? STRINGS.pauseAgent : STRINGS.resumeAgent}
          aria-pressed={!status?.active}
        >
          {pauseMutation.isPending ? (
            <Loader2 size={16} className="animate-spin" aria-hidden="true" />
          ) : status?.active ? (
            <PowerOff size={16} aria-hidden="true" />
          ) : (
            <Power size={16} aria-hidden="true" />
          )}
          {status?.active ? STRINGS.pauseAgent : STRINGS.resumeAgent}
        </button>

        {/* Kill switch */}
        <button
          type="button"
          onClick={handleKillSwitch}
          className="btn-danger"
          aria-label={killConfirm ? "Confirm kill switch" : STRINGS.killSwitch}
        >
          <AlertTriangle size={16} aria-hidden="true" />
          {killConfirm ? "Confirm — Stop Agent" : STRINGS.killSwitch}
        </button>
        {killConfirm && (
          <button
            type="button"
            onClick={() => setKillConfirm(false)}
            className="text-xs text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Cancel kill switch"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Last action */}
      {status?.lastAction && (
        <p className="text-xs text-slate-500 pt-1">
          Last action: <span className="text-slate-400">{status.lastAction}</span>
        </p>
      )}
    </section>
  );
}

export default function AgentChat() {
  return (
    <WagmiProvider>
      <AgentChatInner />
    </WagmiProvider>
  );
}
