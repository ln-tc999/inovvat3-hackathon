import { CheckCircle, ArrowRight, Zap } from "lucide-react";
import type { GenerateProfileResponse } from "../../../lib/api";

interface Props {
  profile:  GenerateProfileResponse;
  userName: string;
}

export default function StepSuccess({ profile, userName }: Props) {
  const greeting = userName.trim() ? `${userName.trim()}, your` : "Your";

  return (
    <div className="flex flex-col items-center gap-8 text-center">
      <div style={{
        width: 72, height: 72, borderRadius: "50%",
        background: "color-mix(in srgb, var(--accent) 15%, var(--surface))",
        border: "2px solid var(--accent)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <CheckCircle size={36} color="var(--accent)" />
      </div>

      <div>
        <h2 style={{ fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }}>
          Agent Activated!
        </h2>
        <p style={{ fontSize: 15, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }}>
          {greeting} agent <strong style={{ color: "var(--accent)" }}>{profile.agentName}</strong> is now configured and ready to optimize your yield 24/7.
        </p>
      </div>

      <div style={{
        width: "100%", maxWidth: 360,
        background: "var(--surface)", borderRadius: 12,
        border: "1px solid var(--border)", padding: "16px 20px",
        textAlign: "left",
      }}>
        <div className="flex items-center gap-2" style={{ marginBottom: 12 }}>
          <Zap size={16} color="var(--accent)" />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>What happens next</span>
        </div>
        {[
          "Your agent instruction has been set",
          "Agent will monitor Aave & Morpho every 6h",
          "Automatic rebalancing when better yield found",
          "You can pause or update anytime from dashboard",
        ].map((item, i) => (
          <div key={i} className="flex items-start gap-3" style={{ marginBottom: i < 3 ? 8 : 0 }}>
            <div style={{
              width: 20, height: 20, borderRadius: 6, flexShrink: 0,
              background: "var(--accent)", marginTop: 1,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 10, fontWeight: 700, color: "#fff",
            }}>
              {i + 1}
            </div>
            <p style={{ fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.4 }}>{item}</p>
          </div>
        ))}
      </div>

      <a
        href="/dashboard"
        className="d-btn d-btn-primary"
        style={{ width: "100%", maxWidth: 360, justifyContent: "center", height: 48, fontSize: 15, textDecoration: "none" }}
      >
        Go to Dashboard
        <ArrowRight size={16} />
      </a>
    </div>
  );
}
