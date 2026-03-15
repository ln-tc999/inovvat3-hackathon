import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { TrendingUp, AlertTriangle } from "lucide-react";
import type { RiskTier } from "../../../lib/db";

const schema = z.object({
  yieldTarget: z.number().min(1, "Min 1%").max(50, "Max 50%"),
});
type FormData = z.infer<typeof schema>;

interface Props {
  riskTier:      RiskTier | undefined;
  yieldTarget:   number | undefined;
  onChange:      (v: number) => void;
  onNext:        (yieldTarget: number) => void;
  onBack:        () => void;
}

const TIER_SUGGESTIONS: Record<RiskTier, { min: number; max: number; default: number }> = {
  conservative: { min: 3,  max: 6,  default: 4  },
  moderate:     { min: 5,  max: 10, default: 7  },
  aggressive:   { min: 8,  max: 20, default: 10 },
};

const QUICK_TARGETS = [4, 6, 8, 10, 12];

export default function StepLimits({ riskTier, yieldTarget, onChange, onNext, onBack }: Props) {
  const suggestion = riskTier ? TIER_SUGGESTIONS[riskTier] : TIER_SUGGESTIONS.moderate;

  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { yieldTarget: yieldTarget ?? suggestion.default },
  });

  const currentTarget = watch("yieldTarget");

  function onSubmit(data: FormData) {
    onChange(data.yieldTarget);
    onNext(data.yieldTarget);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Set your yield target
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
          Your agent will aim for this APY. Realistic targets get better results.
        </p>
      </div>

      {/* APY target input */}
      <div>
        <label htmlFor="yieldTarget" style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Target APY
        </label>

        {/* Big number display */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "24px", borderRadius: 12,
          border: "1px solid var(--border)", background: "var(--surface)",
          marginBottom: 12,
        }}>
          <TrendingUp size={24} color="var(--accent)" style={{ marginRight: 12 }} />
          <span style={{ fontSize: 48, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }}>
            {currentTarget ?? suggestion.default}
          </span>
          <span style={{ fontSize: 24, fontWeight: 700, color: "var(--muted)", marginLeft: 4 }}>%</span>
        </div>

        {/* Quick select */}
        <div className="flex gap-2 flex-wrap" style={{ marginBottom: 12 }}>
          {QUICK_TARGETS.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => { setValue("yieldTarget", t); onChange(t); }}
              className="d-badge"
              style={{
                cursor: "pointer", fontSize: 13, padding: "5px 14px",
                borderColor: currentTarget === t ? "var(--accent)" : "var(--border)",
                color: currentTarget === t ? "var(--accent)" : "var(--muted)",
                background: currentTarget === t ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
                transition: "all 0.15s ease",
              }}
            >
              {t}%
            </button>
          ))}
        </div>

        {/* Manual input */}
        <input
          id="yieldTarget"
          type="number"
          min={1}
          max={50}
          step={0.5}
          className="d-input"
          style={{ textAlign: "center", fontSize: 16 }}
          aria-invalid={!!errors.yieldTarget}
          {...register("yieldTarget", { valueAsNumber: true, onChange: (e) => onChange(Number(e.target.value)) })}
        />
        {errors.yieldTarget && (
          <p role="alert" style={{ fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }}>
            <AlertTriangle size={12} />
            {errors.yieldTarget.message}
          </p>
        )}

        {/* Suggestion hint */}
        {riskTier && (
          <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>
            Recommended for {riskTier}: {suggestion.min}–{suggestion.max}% APY
          </p>
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="d-btn d-btn-default" style={{ flex: 1, justifyContent: "center" }}>Back</button>
        <button type="submit" className="d-btn d-btn-primary" style={{ flex: 2, justifyContent: "center" }}>
          Generate My Agent
        </button>
      </div>
    </form>
  );
}
