import { Clock } from "lucide-react";

interface Props {
  assets: string[];
  timeHorizon: "short" | "medium" | "long" | undefined;
  onAssetsChange: (v: string[]) => void;
  onHorizonChange: (v: "short" | "medium" | "long") => void;
  onNext: () => void;
  onBack: () => void;
}

const ASSETS = [
  { id: "USDC", label: "USDC", desc: "USD Coin — most liquid" },
  { id: "DAI",  label: "DAI",  desc: "Dai — decentralized stable" },
  { id: "USDT", label: "USDT", desc: "Tether — highest TVL" },
];

const HORIZONS: { id: "short" | "medium" | "long"; label: string; desc: string }[] = [
  { id: "short",  label: "Short",  desc: "1–3 months" },
  { id: "medium", label: "Medium", desc: "3–12 months" },
  { id: "long",   label: "Long",   desc: "1+ years" },
];

export default function StepAssets({ assets, timeHorizon, onAssetsChange, onHorizonChange, onNext, onBack }: Props) {
  function toggleAsset(id: string) {
    if (assets.includes(id)) {
      if (assets.length === 1) return; // keep at least one
      onAssetsChange(assets.filter((a) => a !== id));
    } else {
      onAssetsChange([...assets, id]);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Preferred assets & horizon
        </h2>
        <p style={{ fontSize: 14, color: "var(--muted)", marginTop: 6 }}>
          Your agent will only use these assets. Select all that apply.
        </p>
      </div>

      {/* Asset selection */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Assets
        </p>
        <div className="flex flex-col gap-2">
          {ASSETS.map((asset) => {
            const selected = assets.includes(asset.id);
            return (
              <button
                key={asset.id}
                type="button"
                onClick={() => toggleAsset(asset.id)}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "12px 16px", borderRadius: 10,
                  border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 8,
                    background: selected ? "var(--accent)" : "var(--surface-2)",
                    border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, fontWeight: 700,
                    color: selected ? "#fff" : "var(--muted)",
                    transition: "all 0.15s ease",
                  }}>
                    {asset.id.slice(0, 2)}
                  </div>
                  <div style={{ textAlign: "left" }}>
                    <p style={{ fontSize: 14, fontWeight: 600, color: selected ? "var(--accent)" : "var(--text)", margin: 0 }}>{asset.label}</p>
                    <p style={{ fontSize: 12, color: "var(--muted)", margin: 0 }}>{asset.desc}</p>
                  </div>
                </div>
                <div style={{
                  width: 20, height: 20, borderRadius: 6,
                  border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "var(--accent)" : "transparent",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease",
                }}>
                  {selected && <span style={{ color: "#fff", fontSize: 12, fontWeight: 700 }}>✓</span>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Time horizon */}
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }}>
          <Clock size={13} /> Time Horizon
        </p>
        <div className="flex gap-2">
          {HORIZONS.map((h) => {
            const selected = timeHorizon === h.id;
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => onHorizonChange(h.id)}
                style={{
                  flex: 1, padding: "10px 8px", borderRadius: 10, textAlign: "center",
                  border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  background: selected ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
                  cursor: "pointer", transition: "all 0.15s ease",
                }}
              >
                <p style={{ fontSize: 13, fontWeight: 600, color: selected ? "var(--accent)" : "var(--text)", margin: 0 }}>{h.label}</p>
                <p style={{ fontSize: 11, color: "var(--muted)", margin: "2px 0 0" }}>{h.desc}</p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack} className="d-btn d-btn-default" style={{ flex: 1, justifyContent: "center" }}>Back</button>
        <button
          onClick={onNext}
          disabled={assets.length === 0 || !timeHorizon}
          className="d-btn d-btn-primary"
          style={{ flex: 2, justifyContent: "center" }}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
