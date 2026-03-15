import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import { Send, Loader2, CheckCircle, AlertTriangle, Sparkles } from "lucide-react";
import { apiClient } from "../../../lib/api";
import { addHistoryEntry, getRiskProfile } from "../../../lib/db";
import { STRINGS } from "../../../lib/strings";

const schema = z.object({ instruction: z.string().min(5, "Too short").max(500) });
type FormData = z.infer<typeof schema>;

const QUICK_SUGGESTIONS = [
  "Maximize yield with low risk on stablecoins only",
  "Compound every 6 hours, risk < 5%",
  "Rebalance weekly, preserve principal",
  "Aggressive yield, accept higher risk",
];

export default function AgentInstructionPanel() {
  const { address } = useAccount();
  const qc = useQueryClient();
  const [llmPreview, setLlmPreview] = useState<{ preview: string; apy: number; risk: number } | null>(null);

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
    defaultValues: { instruction: "" },
  });

  useEffect(() => {
    const current = status?.instruction || profile?.generatedInstruction || "";
    if (current) setValue("instruction", current);
  }, [status?.instruction, profile?.generatedInstruction]);

  const charCount = watch("instruction")?.length ?? 0;

  const suggestions = profile?.generatedInstruction
    ? [profile.generatedInstruction, ...QUICK_SUGGESTIONS.slice(1)]
    : QUICK_SUGGESTIONS;

  const mutation = useMutation({
    mutationFn: (d: FormData) =>
      apiClient.setInstruction({ instruction: d.instruction, userAddress: address }),
    onSuccess: async (res) => {
      setLlmPreview({ preview: res.preview, apy: res.suggestedAPY, risk: res.riskScore });
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "set-instruction",
        reason: res.preview,
        apyBps: res.suggestedAPY,
        profitUSD: 0,
      });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
      setTimeout(() => setLlmPreview(null), 8000);
    },
  });

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Sparkles size={16} style={{ color: "var(--accent)" }} />
        <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>Instruction</p>
      </div>

      <p style={{ fontSize: 13, color: "var(--muted)", marginTop: -8 }}>
        Tell your agent what to do in plain English. Qwen AI will interpret and execute.
      </p>

      {/* Quick suggestions */}
      <div className="flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue("instruction", s)}
            className="d-badge d-badge-purple"
            style={{ cursor: "pointer", fontSize: 11 }}
          >
            {s.length > 32 ? s.slice(0, 32) + "…" : s}
          </button>
        ))}
      </div>

      {/* Textarea */}
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <div style={{ position: "relative" }}>
          <label htmlFor="agent-instruction-full" className="sr-only">Agent instruction</label>
          <textarea
            id="agent-instruction-full"
            rows={4}
            placeholder={STRINGS.chatPlaceholder}
            className="d-input"
            style={{ resize: "vertical", minHeight: 100 }}
            aria-invalid={!!errors.instruction}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                handleSubmit((d) => mutation.mutate(d))();
            }}
            {...register("instruction")}
          />
          <span style={{ position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "var(--muted)" }}>
            {charCount}/500
          </span>
        </div>

        {errors.instruction && (
          <p role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} /> {errors.instruction.message}
          </p>
        )}

        <button
          type="submit"
          disabled={mutation.isPending}
          className="d-btn d-btn-primary"
          style={{ marginTop: 12, width: "100%", justifyContent: "center" }}
        >
          {mutation.isPending
            ? <><Loader2 size={14} className="animate-spin" /> Sending to AI...</>
            : <><Send size={14} /> Update Instruction</>
          }
        </button>
      </form>

      {/* LLM response preview */}
      {llmPreview && (
        <div style={{
          padding: "12px 14px", borderRadius: 8,
          background: "color-mix(in srgb, var(--accent) 8%, var(--surface))",
          border: "1px solid var(--accent)",
        }}>
          <div className="flex items-center gap-2" style={{ marginBottom: 6 }}>
            <CheckCircle size={14} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent)" }}>AI Response</span>
            <span style={{ marginLeft: "auto", fontSize: 11, color: "var(--muted)" }}>
              {(llmPreview.apy / 100).toFixed(1)}% APY · Risk {llmPreview.risk}/10
            </span>
          </div>
          <p style={{ fontSize: 13, color: "var(--text)", lineHeight: 1.6 }}>{llmPreview.preview}</p>
        </div>
      )}
    </div>
  );
}
