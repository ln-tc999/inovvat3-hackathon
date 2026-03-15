import { Loader2, Zap, Shield, TrendingUp, AlertTriangle, ExternalLink } from "lucide-react";
import type { GenerateProfileResponse } from "../../../lib/api";
import type { OnboardingFormData } from "../useOnboarding";

interface Props {
  profile:      GenerateProfileResponse;
  formData:     Partial<OnboardingFormData>;
  isSubmitting: boolean;
  error:        string | null;
  txHash:       string | null;
  onConfirm:    () => void;
  onBack:       () => void;
}

const TIER_COLOR: Record<string, string> = {
  conservative: "var(--accent-2)",
  moderate:     "var(--accent)",
  aggressive:   "var(--danger)",
};

export default function StepConfirm({ profile, formData, isSubmitting, error, txHash, onConfirm, onBack }: Props) {
  const tierColor = TIER_COLOR[formData.riskTier ?? "moderate"];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Your AI Agent is ready
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
          Review your personalized configuration before activating.
        </p>
      </div>

      {/* Agent card */}
      <div style={{
        borderRadius: 16, border: `1px solid ${tierColor}`,
        background: `color-mix(in srgb, ${tierColor} 5%, var(--surface))`,
        padding: 24,
      }}>
        {/* Agent name + personality */}
        <div className="flex items-center gap-3" style={{ marginBottom: 16 }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: tierColor,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Zap size={24} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }}>
              {profile.agentName}
            </p>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: "2px 0 0" }}>
              {profile.agentPersonality}
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="flex gap-3 flex-wrap" style={{ marginBottom: 16 }}>
          {[
            { icon: TrendingUp, label: "Target APY",   value: `${(profile.suggestedAPY / 100).toFixed(1)}%` },
            { icon: Shield,     label: "Risk Score",   value: `${profile.maxRisk}/10` },
            { icon: Zap,        label: "Daily Limit",  value: `$${profile.dailyLimitUSD.toLocaleString()}` },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{
              flex: 1, minWidth: 90,
              background: "var(--surface-2)", borderRadius: 10,
              border: "1px solid var(--border)", padding: "10px 14px",
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                <Icon size={13} color="var(--muted)" />
                <span style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</span>
              </div>
              <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }}>{value}</p>
            </div>
          ))}
        </div>

        {/* Generated instruction */}
        <div style={{
          background: "var(--bg-subtle)", borderRadius: 10,
          border: "1px solid var(--border)", padding: "12px 14px",
        }}>
          <p style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
            Agent Instruction
          </p>
          <p style={{ fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }}>
            "{profile.generatedInstruction}"
          </p>
        </div>
      </div>

      {/* Reasoning */}
      <div style={{
        background: "var(--surface)", borderRadius: 10,
        border: "1px solid var(--border)", padding: "14px 16px",
      }}>
        <p style={{ fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }}>Why this configuration?</p>
        <p style={{ fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.5 }}>
          {profile.reasoning}
        </p>
      </div>

      {/* Assets + horizon summary */}
      <div className="flex gap-2 flex-wrap">
        {formData.preferredAssets?.map((a) => (
          <span key={a} className="d-badge d-badge-purple" style={{ fontSize: 12 }}>{a}</span>
        ))}
        <span className="d-badge" style={{ fontSize: 12 }}>
          {formData.timeHorizon === "short" ? "1–3 months" : formData.timeHorizon === "medium" ? "3–12 months" : "1+ years"}
        </span>
        <span className="d-badge" style={{ fontSize: 12, borderColor: tierColor, color: tierColor }}>
          {formData.riskTier}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "10px 14px", borderRadius: 8,
          background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
          border: "1px solid var(--danger)",
        }}>
          <AlertTriangle size={14} color="var(--danger)" />
          <p style={{ fontSize: 13, color: "var(--danger)", margin: 0 }}>{error}</p>
        </div>
      )}

      {/* Tx hash */}
      {txHash && (
        <a
          href={`https://sepolia.basescan.org/tx/${txHash}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 }}
        >
          <ExternalLink size={12} />
          View transaction on Basescan
        </a>
      )}

      <div className="flex gap-3">
        <button onClick={onBack} disabled={isSubmitting} className="d-btn d-btn-default" style={{ flex: 1, justifyContent: "center" }}>
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={isSubmitting}
          className="d-btn d-btn-primary"
          style={{ flex: 2, justifyContent: "center" }}
        >
          {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
          {isSubmitting ? "Activating..." : "Activate Agent"}
        </button>
      </div>
    </div>
  );
}
