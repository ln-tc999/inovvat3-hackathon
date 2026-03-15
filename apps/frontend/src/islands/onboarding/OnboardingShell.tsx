import { WagmiProvider } from "../../components/WagmiProvider";
import { useTheme } from "../../lib/useTheme";
import { useOnboarding } from "./useOnboarding";
import StepWelcome from "./steps/StepWelcome";
import StepRiskTier from "./steps/StepRiskTier";
import StepAssets from "./steps/StepAssets";
import StepLimits from "./steps/StepLimits";
import StepConfirm from "./steps/StepConfirm";
import StepSuccess from "./steps/StepSuccess";
import { Sun, Moon } from "lucide-react";

const STEP_LABELS = ["Welcome", "Risk", "Assets", "Target", "Confirm"];

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div style={{ marginBottom: 32 }}>
      {/* Step dots */}
      <div className="flex items-center justify-center gap-2" style={{ marginBottom: 12 }}>
        {STEP_LABELS.map((label, i) => {
          const idx = i + 1;
          const done    = idx < step;
          const current = idx === step;
          if (step === 5) return null; // hide on success
          return (
            <div key={label} className="flex items-center gap-2">
              <div style={{
                width: current ? 28 : 20,
                height: 20,
                borderRadius: 10,
                background: done ? "var(--accent)" : current ? "var(--accent)" : "var(--surface-2)",
                border: `1px solid ${done || current ? "var(--accent)" : "var(--border)"}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 10, fontWeight: 700,
                color: done || current ? "#fff" : "var(--muted)",
                transition: "all 0.2s ease",
              }}>
                {done ? "✓" : idx}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div style={{
                  width: 24, height: 1,
                  background: done ? "var(--accent)" : "var(--border)",
                  transition: "background 0.2s ease",
                }} />
              )}
            </div>
          );
        })}
      </div>

      {/* Progress bar */}
      {step < 5 && (
        <div style={{ height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }}>
          <div style={{
            height: "100%",
            width: `${((step - 1) / (STEP_LABELS.length - 1)) * 100}%`,
            background: "var(--accent)",
            borderRadius: 2,
            transition: "width 0.3s ease",
          }} />
        </div>
      )}
    </div>
  );
}

function OnboardingContent() {
  const { isDark, toggle } = useTheme();
  const {
    step, formData, generatedProfile,
    isGenerating, isSubmitting, error, txHash,
    updateForm, nextStep, prevStep,
    generateProfile, confirmAndSave,
  } = useOnboarding();

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }}>
      {/* Top bar */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "16px 24px",
        borderBottom: "1px solid var(--border)",
      }}>
        <a href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: "var(--accent)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 10, fontWeight: 700, color: "#fff",
          }}>YG</div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "var(--text)" }}>YieldGuard</span>
        </a>
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="btn-fill-up"
          style={{
            width: 34, height: 34, borderRadius: 8,
            background: "var(--surface-2)", border: "1px solid var(--border)",
            color: "var(--muted)", display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
          }}
        >
          {isDark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>
        <div style={{
          width: "100%", maxWidth: 520,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 20,
          padding: "32px",
          boxShadow: "var(--shadow)",
        }}>
          <ProgressBar step={step} total={5} />

          {step === 1 && (
            <StepWelcome
              name={formData.userName ?? ""}
              onNameChange={(v) => updateForm({ userName: v })}
              onNext={nextStep}
            />
          )}

          {step === 2 && (
            <StepRiskTier
              value={formData.riskTier}
              onChange={(v) => updateForm({ riskTier: v })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 3 && (
            <StepAssets
              assets={formData.preferredAssets ?? ["USDC"]}
              timeHorizon={formData.timeHorizon}
              onAssetsChange={(v) => updateForm({ preferredAssets: v })}
              onHorizonChange={(v) => updateForm({ timeHorizon: v })}
              onNext={nextStep}
              onBack={prevStep}
            />
          )}

          {step === 4 && (
            <StepLimits
              riskTier={formData.riskTier}
              yieldTarget={formData.yieldTarget}
              onChange={(v) => updateForm({ yieldTarget: v })}
              onNext={(yieldTarget) => generateProfile({ yieldTarget })}
              onBack={prevStep}
            />
          )}

          {/* Generating overlay */}
          {isGenerating && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(0,0,0,0.5)",
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center", gap: 16,
            }}>
              <div style={{
                background: "var(--surface)", borderRadius: 16,
                border: "1px solid var(--border)", padding: "32px 40px",
                textAlign: "center",
              }}>
                <div className="animate-spin" style={{
                  width: 40, height: 40, borderRadius: "50%",
                  border: "3px solid var(--border)",
                  borderTopColor: "var(--accent)",
                  margin: "0 auto 16px",
                }} />
                <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }}>
                  Generating your AI agent...
                </p>
                <p style={{ fontSize: 13, color: "var(--muted)", marginTop: 6 }}>
                  Qwen is analyzing your preferences
                </p>
              </div>
            </div>
          )}

          {/* Error banner (shown when not generating) */}
          {error && !isGenerating && step === 4 && (
            <div style={{
              marginTop: 12, padding: "10px 14px", borderRadius: 8,
              background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
              border: "1px solid var(--danger)",
              fontSize: 13, color: "var(--danger)",
            }}>
              {error}
            </div>
          )}

          {step === 5 && generatedProfile && (
            <StepConfirm
              profile={generatedProfile}
              formData={formData}
              isSubmitting={isSubmitting}
              error={error}
              txHash={txHash}
              onConfirm={confirmAndSave}
              onBack={prevStep}
            />
          )}

          {/* Step 6 = success (step goes to 6 after confirm) */}
          {(step as number) === 6 && generatedProfile && (
            <StepSuccess profile={generatedProfile} userName={formData.userName ?? ""} />
          )}
        </div>
      </div>
    </div>
  );
}

function OnboardingShellInner() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <OnboardingContent />
    </WagmiProvider>
  );
}

export default function OnboardingShell() {
  return <OnboardingShellInner />;
}
