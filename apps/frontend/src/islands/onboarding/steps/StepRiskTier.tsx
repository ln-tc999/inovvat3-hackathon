import { Shield, BarChart2, Flame } from "lucide-react";
import type { RiskTier } from "../../../lib/db";

interface Props {
  value: RiskTier | undefined;
  onChange: (v: RiskTier) => void;
  onNext: () => void;
  onBack: () => void;
}

const TIERS: {
  id: RiskTier;
  icon: React.ElementType;
  label: string;
  subtitle: string;
  apyRange: string;
  color: string;
}[] = [
  {
    id: "conservative",
    icon: Shield,
    label: "Conservative",
    subtitle: "Capital preservation first. Steady, predictable yield.",
    apyRange: "3–5% APY",
    color: "var(--accent-2)",
  },
  {
    id: "moderate",
    icon: BarChart2,
    label: "Moderate",
    subtitle: "Balance between safety and yield. Smart rebalancing.",
    apyRange: "5–8% APY",
    color: "var(--accent)",
  },
  {
    id: "aggressive",
    icon: Flame,
    label: "Aggressive",
    subtitle: "Maximize yield. Higher risk, higher reward.",
    apyRange: "8–12% APY",
    color: "var(--danger)",
  },
];

export default function StepRiskTier({ value, onChange, onNext, onBack }: Props) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          What's your risk tolerance?
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
          Your agent will only operate within this risk boundary.
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {TIERS.map((tier) => {
          const Icon = tier.icon;
          const selected = value === tier.id;
          return (
            <button
              key={tier.id}
              type="button"
              onClick={() => onChange(tier.id)}
              style={{
                display: "flex", alignItems: "center", gap: 16,
                padding: "16px 20px",
                borderRadius: 12,
                border: `1px solid ${selected ? tier.color : "var(--border)"}`,
                background: selected ? `color-mix(in srgb, ${tier.color} 8%, var(--surface))` : "var(--surface)",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{
                width: 44, height: 44, borderRadius: 10, flexShrink: 0,
                background: selected ? tier.color : "var(--surface-2)",
                border: `1px solid ${selected ? tier.color : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.15s ease",
              }}>
                <Icon size={20} color={selected ? "#fff" : "var(--muted)"} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span style={{ fontSize: 15, fontWeight: 600, color: selected ? tier.color : "var(--text)" }}>
                    {tier.label}
                  </span>
                  <span className="d-badge" style={{ borderColor: tier.color, color: tier.color, fontSize: 11 }}>
                    {tier.apyRange}
                  </span>
                </div>
                <p style={{ fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }}>
                  {tier.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="d-btn d-btn-default" style={{ flex: 1, justifyContent: "center" }}>
          Back
        </button>
        <button
          onClick={onNext}
          disabled={!value}
          className="d-btn d-btn-primary"
          style={{ flex: 2, justifyContent: "center" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
