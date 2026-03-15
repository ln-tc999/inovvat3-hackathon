/* empty css                                   */
import { e as createComponent, k as renderComponent, r as renderTemplate } from '../chunks/astro/server_BSg5bIr_.mjs';
import { $ as $$MainLayout } from '../chunks/MainLayout_Ci2xpOI8.mjs';
import { jsxs, jsx, Fragment } from 'react/jsx-runtime';
import { u as useTheme, W as WagmiProvider } from '../chunks/useTheme_Bx62c_5d.mjs';
import { useState } from 'react';
import { useAccount, useWriteContract } from 'wagmi';
import { keccak256, toBytes, parseUnits } from 'viem';
import { s as saveRiskProfile, a as apiClient } from '../chunks/api_BdfuQB5h.mjs';
import { Zap, Shield, TrendingUp, User, AlertTriangle, BarChart2, Flame, Clock, ExternalLink, Loader2, CheckCircle, ArrowRight, Sun, Moon } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
export { renderers } from '../renderers.mjs';

const AGENT_POLICY_ABI = [
  {
    name: "setPolicy",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "maxRisk", type: "uint8" },
      { name: "dailyLimit", type: "uint256" },
      { name: "sessionDuration", type: "uint256" },
      { name: "instructionHash", type: "bytes32" },
      { name: "allowedProtocols", type: "address[]" }
    ],
    outputs: []
  }
];
const AGENT_POLICY_ADDRESS = "0xA6ba2CF98B043eA522650535B56Be9bE46371f88";
const AAVE_ADAPTER = "0x4071DdCe831E484640e864a8627cc3ece308e895";
const MORPHO_ADAPTER = "0xf9B035426d2A16EF00F0547dc0F4Ed9226D2671d";
function useOnboarding() {
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});
  const [generatedProfile, setGenerated] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [txHash, setTxHash] = useState(null);
  function updateForm(data) {
    setFormData((prev) => ({ ...prev, ...data }));
  }
  function nextStep() {
    setStep((s) => Math.min(s + 1, 6));
  }
  function prevStep() {
    setStep((s) => Math.max(s - 1, 1));
  }
  async function generateProfile(overrides) {
    const data = { ...formData, ...overrides };
    const preferredAssets = data.preferredAssets?.length ? data.preferredAssets : ["USDC"];
    if (!data.riskTier || !data.timeHorizon || !data.yieldTarget) {
      console.warn("[Onboarding] generateProfile called with incomplete data:", data);
      return;
    }
    setIsGenerating(true);
    setError(null);
    try {
      const profile = await apiClient.generateProfile({
        riskTier: data.riskTier,
        preferredAssets,
        timeHorizon: data.timeHorizon,
        yieldTarget: data.yieldTarget,
        walletAddress: address
      });
      setGenerated(profile);
      nextStep();
    } catch (e) {
      console.error("[Onboarding] generateProfile error:", e);
      setError(e?.message ?? "Failed to generate profile. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  }
  async function confirmAndSave() {
    if (!generatedProfile || !address || !formData.riskTier) return;
    setIsSubmitting(true);
    setError(null);
    try {
      if (AGENT_POLICY_ADDRESS && AGENT_POLICY_ADDRESS !== "") {
        const instructionHash = keccak256(toBytes(generatedProfile.generatedInstruction));
        const dailyLimitWei = parseUnits(String(generatedProfile.dailyLimitUSD), 18);
        const sessionDuration = BigInt(30 * 24 * 60 * 60);
        const allowedProtocols = [];
        if (AAVE_ADAPTER) allowedProtocols.push(AAVE_ADAPTER);
        if (MORPHO_ADAPTER) allowedProtocols.push(MORPHO_ADAPTER);
        const hash = await writeContractAsync({
          address: AGENT_POLICY_ADDRESS,
          abi: AGENT_POLICY_ABI,
          functionName: "setPolicy",
          args: [
            generatedProfile.maxRisk,
            dailyLimitWei,
            sessionDuration,
            instructionHash,
            allowedProtocols
          ]
        });
        setTxHash(hash);
      }
      await saveRiskProfile({
        walletAddress: address,
        userName: formData.userName ?? "Anon",
        riskTier: formData.riskTier,
        maxRisk: generatedProfile.maxRisk,
        dailyLimitUSD: generatedProfile.dailyLimitUSD,
        preferredAssets: formData.preferredAssets?.length ? formData.preferredAssets : ["USDC"],
        timeHorizon: formData.timeHorizon ?? "medium",
        yieldTarget: formData.yieldTarget ?? 5,
        agentName: generatedProfile.agentName,
        generatedInstruction: generatedProfile.generatedInstruction,
        onboardingComplete: true,
        createdAt: Date.now(),
        updatedAt: Date.now()
      });
      await apiClient.setInstruction({
        instruction: generatedProfile.generatedInstruction,
        maxRisk: generatedProfile.maxRisk,
        userAddress: address
      });
      nextStep();
    } catch (e) {
      if (e?.message?.includes("User rejected")) {
        setError("Transaction rejected. Profile saved locally only.");
      } else {
        await saveRiskProfile({
          walletAddress: address,
          userName: formData.userName ?? "Anon",
          riskTier: formData.riskTier,
          maxRisk: generatedProfile.maxRisk,
          dailyLimitUSD: generatedProfile.dailyLimitUSD,
          preferredAssets: formData.preferredAssets?.length ? formData.preferredAssets : ["USDC"],
          timeHorizon: formData.timeHorizon ?? "medium",
          yieldTarget: formData.yieldTarget ?? 5,
          agentName: generatedProfile.agentName,
          generatedInstruction: generatedProfile.generatedInstruction,
          onboardingComplete: true,
          createdAt: Date.now(),
          updatedAt: Date.now()
        });
        nextStep();
      }
    } finally {
      setIsSubmitting(false);
    }
  }
  return {
    step,
    formData,
    generatedProfile,
    isGenerating,
    isSubmitting,
    error,
    txHash,
    updateForm,
    nextStep,
    prevStep,
    generateProfile,
    confirmAndSave
  };
}

function StepWelcome({ name, onNameChange, onNext }) {
  const { isConnected } = useAccount();
  const [touched, setTouched] = useState(false);
  const isValid = name.trim().length >= 2;
  const showError = touched && !isValid;
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-7 text-center", children: [
    /* @__PURE__ */ jsx("div", { style: {
      width: 64,
      height: 64,
      borderRadius: 16,
      background: "var(--accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }, children: /* @__PURE__ */ jsx(Zap, { size: 32, color: "#fff" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h1", { style: { fontSize: 28, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "Meet Your AI Yield Agent" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 15, color: "var(--muted)", marginTop: 10, lineHeight: 1.6, maxWidth: 420 }, children: "Answer 4 quick questions and we'll configure an AI agent that matches your risk profile and yield goals — automatically." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-wrap justify-center gap-3", children: [
      { icon: Shield, label: "Non-custodial" },
      { icon: TrendingUp, label: "Up to 12% APY" },
      { icon: Zap, label: "24/7 autonomous" }
    ].map(({ icon: Icon, label }) => /* @__PURE__ */ jsxs("div", { className: "d-badge d-badge-purple", style: { padding: "6px 14px", fontSize: 13 }, children: [
      /* @__PURE__ */ jsx(Icon, { size: 13 }),
      label
    ] }, label)) }),
    /* @__PURE__ */ jsxs("div", { style: { width: "100%", maxWidth: 320, textAlign: "left" }, children: [
      /* @__PURE__ */ jsxs("label", { htmlFor: "user-name", style: {
        fontSize: 13,
        fontWeight: 600,
        color: "var(--muted)",
        display: "flex",
        alignItems: "center",
        gap: 6,
        marginBottom: 8,
        textTransform: "uppercase",
        letterSpacing: "0.05em"
      }, children: [
        /* @__PURE__ */ jsx(User, { size: 13 }),
        "What should we call you?"
      ] }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "user-name",
          type: "text",
          placeholder: "e.g. Alex, or just your nickname",
          maxLength: 40,
          className: "d-input",
          value: name,
          onChange: (e) => onNameChange(e.target.value),
          onBlur: () => setTouched(true),
          "aria-invalid": showError,
          style: { textAlign: "left" }
        }
      ),
      showError && /* @__PURE__ */ jsxs("p", { role: "alert", style: { fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 12 }),
        "Please enter at least 2 characters"
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col items-center gap-3 w-full", style: { maxWidth: 320 }, children: !isConnected ? /* @__PURE__ */ jsxs(Fragment, { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)" }, children: "Connect your wallet to get started" }),
      /* @__PURE__ */ jsx(ConnectButton, { label: "Connect Wallet", showBalance: false, chainStatus: "none" })
    ] }) : /* @__PURE__ */ jsxs(
      "button",
      {
        onClick: () => {
          setTouched(true);
          if (isValid) onNext();
        },
        className: "d-btn d-btn-primary",
        style: { width: "100%", justifyContent: "center", height: 48, fontSize: 15 },
        children: [
          "Get Started",
          /* @__PURE__ */ jsx(Zap, { size: 16 })
        ]
      }
    ) })
  ] });
}

const TIERS = [
  {
    id: "conservative",
    icon: Shield,
    label: "Conservative",
    subtitle: "Capital preservation first. Steady, predictable yield.",
    apyRange: "3–5% APY",
    color: "var(--accent-2)"
  },
  {
    id: "moderate",
    icon: BarChart2,
    label: "Moderate",
    subtitle: "Balance between safety and yield. Smart rebalancing.",
    apyRange: "5–8% APY",
    color: "var(--accent)"
  },
  {
    id: "aggressive",
    icon: Flame,
    label: "Aggressive",
    subtitle: "Maximize yield. Higher risk, higher reward.",
    apyRange: "8–12% APY",
    color: "var(--danger)"
  }
];
function StepRiskTier({ value, onChange, onNext, onBack }) {
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "What's your risk tolerance?" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", marginTop: 6 }, children: "Your agent will only operate within this risk boundary." })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: TIERS.map((tier) => {
      const Icon = tier.icon;
      const selected = value === tier.id;
      return /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => onChange(tier.id),
          style: {
            display: "flex",
            alignItems: "center",
            gap: 16,
            padding: "16px 20px",
            borderRadius: 12,
            border: `1px solid ${selected ? tier.color : "var(--border)"}`,
            background: selected ? `color-mix(in srgb, ${tier.color} 8%, var(--surface))` : "var(--surface)",
            cursor: "pointer",
            textAlign: "left",
            transition: "all 0.15s ease"
          },
          children: [
            /* @__PURE__ */ jsx("div", { style: {
              width: 44,
              height: 44,
              borderRadius: 10,
              flexShrink: 0,
              background: selected ? tier.color : "var(--surface-2)",
              border: `1px solid ${selected ? tier.color : "var(--border)"}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.15s ease"
            }, children: /* @__PURE__ */ jsx(Icon, { size: 20, color: selected ? "#fff" : "var(--muted)" }) }),
            /* @__PURE__ */ jsxs("div", { style: { flex: 1 }, children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", justifyContent: "space-between" }, children: [
                /* @__PURE__ */ jsx("span", { style: { fontSize: 15, fontWeight: 600, color: selected ? tier.color : "var(--text)" }, children: tier.label }),
                /* @__PURE__ */ jsx("span", { className: "d-badge", style: { borderColor: tier.color, color: tier.color, fontSize: 11 }, children: tier.apyRange })
              ] }),
              /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)", margin: "4px 0 0" }, children: tier.subtitle })
            ] })
          ]
        },
        tier.id
      );
    }) }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onBack, className: "d-btn d-btn-default", style: { flex: 1, justifyContent: "center" }, children: "Back" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onNext,
          disabled: !value,
          className: "d-btn d-btn-primary",
          style: { flex: 2, justifyContent: "center" },
          children: "Continue"
        }
      )
    ] })
  ] });
}

const ASSETS = [
  { id: "USDC", label: "USDC", desc: "USD Coin — most liquid" },
  { id: "DAI", label: "DAI", desc: "Dai — decentralized stable" },
  { id: "USDT", label: "USDT", desc: "Tether — highest TVL" }
];
const HORIZONS = [
  { id: "short", label: "Short", desc: "1–3 months" },
  { id: "medium", label: "Medium", desc: "3–12 months" },
  { id: "long", label: "Long", desc: "1+ years" }
];
function StepAssets({ assets, timeHorizon, onAssetsChange, onHorizonChange, onNext, onBack }) {
  function toggleAsset(id) {
    if (assets.includes(id)) {
      if (assets.length === 1) return;
      onAssetsChange(assets.filter((a) => a !== id));
    } else {
      onAssetsChange([...assets, id]);
    }
  }
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "Preferred assets & horizon" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", marginTop: 6 }, children: "Your agent will only use these assets. Select all that apply." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Assets" }),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2", children: ASSETS.map((asset) => {
        const selected = assets.includes(asset.id);
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => toggleAsset(asset.id),
            style: {
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 16px",
              borderRadius: 10,
              border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
              background: selected ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            children: [
              /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 12 }, children: [
                /* @__PURE__ */ jsx("div", { style: {
                  width: 36,
                  height: 36,
                  borderRadius: 8,
                  background: selected ? "var(--accent)" : "var(--surface-2)",
                  border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11,
                  fontWeight: 700,
                  color: selected ? "#fff" : "var(--muted)",
                  transition: "all 0.15s ease"
                }, children: asset.id.slice(0, 2) }),
                /* @__PURE__ */ jsxs("div", { style: { textAlign: "left" }, children: [
                  /* @__PURE__ */ jsx("p", { style: { fontSize: 14, fontWeight: 600, color: selected ? "var(--accent)" : "var(--text)", margin: 0 }, children: asset.label }),
                  /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: "var(--muted)", margin: 0 }, children: asset.desc })
                ] })
              ] }),
              /* @__PURE__ */ jsx("div", { style: {
                width: 20,
                height: 20,
                borderRadius: 6,
                border: `2px solid ${selected ? "var(--accent)" : "var(--border)"}`,
                background: selected ? "var(--accent)" : "transparent",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.15s ease"
              }, children: selected && /* @__PURE__ */ jsx("span", { style: { color: "#fff", fontSize: 12, fontWeight: 700 }, children: "✓" }) })
            ]
          },
          asset.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em", display: "flex", alignItems: "center", gap: 6 }, children: [
        /* @__PURE__ */ jsx(Clock, { size: 13 }),
        " Time Horizon"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2", children: HORIZONS.map((h) => {
        const selected = timeHorizon === h.id;
        return /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => onHorizonChange(h.id),
            style: {
              flex: 1,
              padding: "10px 8px",
              borderRadius: 10,
              textAlign: "center",
              border: `1px solid ${selected ? "var(--accent)" : "var(--border)"}`,
              background: selected ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
              cursor: "pointer",
              transition: "all 0.15s ease"
            },
            children: [
              /* @__PURE__ */ jsx("p", { style: { fontSize: 13, fontWeight: 600, color: selected ? "var(--accent)" : "var(--text)", margin: 0 }, children: h.label }),
              /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: "var(--muted)", margin: "2px 0 0" }, children: h.desc })
            ]
          },
          h.id
        );
      }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onBack, className: "d-btn d-btn-default", style: { flex: 1, justifyContent: "center" }, children: "Back" }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: onNext,
          disabled: assets.length === 0 || !timeHorizon,
          className: "d-btn d-btn-primary",
          style: { flex: 2, justifyContent: "center" },
          children: "Continue"
        }
      )
    ] })
  ] });
}

const schema = z.object({
  yieldTarget: z.number().min(1, "Min 1%").max(50, "Max 50%")
});
const TIER_SUGGESTIONS = {
  conservative: { min: 3, max: 6, default: 4 },
  moderate: { min: 5, max: 10, default: 7 },
  aggressive: { min: 8, max: 20, default: 10 }
};
const QUICK_TARGETS = [4, 6, 8, 10, 12];
function StepLimits({ riskTier, yieldTarget, onChange, onNext, onBack }) {
  const suggestion = riskTier ? TIER_SUGGESTIONS[riskTier] : TIER_SUGGESTIONS.moderate;
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { yieldTarget: yieldTarget ?? suggestion.default }
  });
  const currentTarget = watch("yieldTarget");
  function onSubmit(data) {
    onChange(data.yieldTarget);
    onNext(data.yieldTarget);
  }
  return /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit(onSubmit), className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "Set your yield target" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", marginTop: 6 }, children: "Your agent will aim for this APY. Realistic targets get better results." })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("label", { htmlFor: "yieldTarget", style: { fontSize: 13, fontWeight: 600, color: "var(--muted)", display: "block", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }, children: "Target APY" }),
      /* @__PURE__ */ jsxs("div", { style: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "24px",
        borderRadius: 12,
        border: "1px solid var(--border)",
        background: "var(--surface)",
        marginBottom: 12
      }, children: [
        /* @__PURE__ */ jsx(TrendingUp, { size: 24, color: "var(--accent)", style: { marginRight: 12 } }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 48, fontWeight: 700, color: "var(--accent)", lineHeight: 1 }, children: currentTarget ?? suggestion.default }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 24, fontWeight: 700, color: "var(--muted)", marginLeft: 4 }, children: "%" })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-2 flex-wrap", style: { marginBottom: 12 }, children: QUICK_TARGETS.map((t) => /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => {
            setValue("yieldTarget", t);
            onChange(t);
          },
          className: "d-badge",
          style: {
            cursor: "pointer",
            fontSize: 13,
            padding: "5px 14px",
            borderColor: currentTarget === t ? "var(--accent)" : "var(--border)",
            color: currentTarget === t ? "var(--accent)" : "var(--muted)",
            background: currentTarget === t ? "color-mix(in srgb, var(--accent) 8%, var(--surface))" : "var(--surface)",
            transition: "all 0.15s ease"
          },
          children: [
            t,
            "%"
          ]
        },
        t
      )) }),
      /* @__PURE__ */ jsx(
        "input",
        {
          id: "yieldTarget",
          type: "number",
          min: 1,
          max: 50,
          step: 0.5,
          className: "d-input",
          style: { textAlign: "center", fontSize: 16 },
          "aria-invalid": !!errors.yieldTarget,
          ...register("yieldTarget", { valueAsNumber: true, onChange: (e) => onChange(Number(e.target.value)) })
        }
      ),
      errors.yieldTarget && /* @__PURE__ */ jsxs("p", { role: "alert", style: { fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 12 }),
        errors.yieldTarget.message
      ] }),
      riskTier && /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: "var(--muted)", marginTop: 8 }, children: [
        "Recommended for ",
        riskTier,
        ": ",
        suggestion.min,
        "–",
        suggestion.max,
        "% APY"
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { type: "button", onClick: onBack, className: "d-btn d-btn-default", style: { flex: 1, justifyContent: "center" }, children: "Back" }),
      /* @__PURE__ */ jsx("button", { type: "submit", className: "d-btn d-btn-primary", style: { flex: 2, justifyContent: "center" }, children: "Generate My Agent" })
    ] })
  ] });
}

const TIER_COLOR = {
  conservative: "var(--accent-2)",
  moderate: "var(--accent)",
  aggressive: "var(--danger)"
};
function StepConfirm({ profile, formData, isSubmitting, error, txHash, onConfirm, onBack }) {
  const tierColor = TIER_COLOR[formData.riskTier ?? "moderate"];
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-6", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: 22, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "Your AI Agent is ready" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", marginTop: 6 }, children: "Review your personalized configuration before activating." })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      borderRadius: 16,
      border: `1px solid ${tierColor}`,
      background: `color-mix(in srgb, ${tierColor} 5%, var(--surface))`,
      padding: 24
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-3", style: { marginBottom: 16 }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 48,
          height: 48,
          borderRadius: 12,
          background: tierColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }, children: /* @__PURE__ */ jsx(Zap, { size: 24, color: "#fff" }) }),
        /* @__PURE__ */ jsxs("div", { children: [
          /* @__PURE__ */ jsx("p", { style: { fontSize: 18, fontWeight: 700, color: "var(--text)", margin: 0 }, children: profile.agentName }),
          /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)", margin: "2px 0 0" }, children: profile.agentPersonality })
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "flex gap-3 flex-wrap", style: { marginBottom: 16 }, children: [
        { icon: TrendingUp, label: "Target APY", value: `${(profile.suggestedAPY / 100).toFixed(1)}%` },
        { icon: Shield, label: "Risk Score", value: `${profile.maxRisk}/10` },
        { icon: Zap, label: "Daily Limit", value: `$${profile.dailyLimitUSD.toLocaleString()}` }
      ].map(({ icon: Icon, label, value }) => /* @__PURE__ */ jsxs("div", { style: {
        flex: 1,
        minWidth: 90,
        background: "var(--surface-2)",
        borderRadius: 10,
        border: "1px solid var(--border)",
        padding: "10px 14px"
      }, children: [
        /* @__PURE__ */ jsxs("div", { style: { display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }, children: [
          /* @__PURE__ */ jsx(Icon, { size: 13, color: "var(--muted)" }),
          /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }, children: label })
        ] }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 16, fontWeight: 700, color: "var(--text)", margin: 0 }, children: value })
      ] }, label)) }),
      /* @__PURE__ */ jsxs("div", { style: {
        background: "var(--bg-subtle)",
        borderRadius: 10,
        border: "1px solid var(--border)",
        padding: "12px 14px"
      }, children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }, children: "Agent Instruction" }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.5, fontStyle: "italic" }, children: [
          '"',
          profile.generatedInstruction,
          '"'
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      background: "var(--surface)",
      borderRadius: 10,
      border: "1px solid var(--border)",
      padding: "14px 16px"
    }, children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: "var(--muted)", margin: "0 0 6px" }, children: "Why this configuration?" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--text)", margin: 0, lineHeight: 1.5 }, children: profile.reasoning })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-2 flex-wrap", children: [
      formData.preferredAssets?.map((a) => /* @__PURE__ */ jsx("span", { className: "d-badge d-badge-purple", style: { fontSize: 12 }, children: a }, a)),
      /* @__PURE__ */ jsx("span", { className: "d-badge", style: { fontSize: 12 }, children: formData.timeHorizon === "short" ? "1–3 months" : formData.timeHorizon === "medium" ? "3–12 months" : "1+ years" }),
      /* @__PURE__ */ jsx("span", { className: "d-badge", style: { fontSize: 12, borderColor: tierColor, color: tierColor }, children: formData.riskTier })
    ] }),
    error && /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      gap: 8,
      padding: "10px 14px",
      borderRadius: 8,
      background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
      border: "1px solid var(--danger)"
    }, children: [
      /* @__PURE__ */ jsx(AlertTriangle, { size: 14, color: "var(--danger)" }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--danger)", margin: 0 }, children: error })
    ] }),
    txHash && /* @__PURE__ */ jsxs(
      "a",
      {
        href: `https://sepolia.basescan.org/tx/${txHash}`,
        target: "_blank",
        rel: "noopener noreferrer",
        style: { fontSize: 12, color: "var(--accent)", display: "flex", alignItems: "center", gap: 4 },
        children: [
          /* @__PURE__ */ jsx(ExternalLink, { size: 12 }),
          "View transaction on Basescan"
        ]
      }
    ),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3", children: [
      /* @__PURE__ */ jsx("button", { onClick: onBack, disabled: isSubmitting, className: "d-btn d-btn-default", style: { flex: 1, justifyContent: "center" }, children: "Back" }),
      /* @__PURE__ */ jsxs(
        "button",
        {
          onClick: onConfirm,
          disabled: isSubmitting,
          className: "d-btn d-btn-primary",
          style: { flex: 2, justifyContent: "center" },
          children: [
            isSubmitting ? /* @__PURE__ */ jsx(Loader2, { size: 16, className: "animate-spin" }) : /* @__PURE__ */ jsx(Zap, { size: 16 }),
            isSubmitting ? "Activating..." : "Activate Agent"
          ]
        }
      )
    ] })
  ] });
}

function StepSuccess({ profile, userName }) {
  const greeting = userName.trim() ? `${userName.trim()}, your` : "Your";
  return /* @__PURE__ */ jsxs("div", { className: "flex flex-col items-center gap-8 text-center", children: [
    /* @__PURE__ */ jsx("div", { style: {
      width: 72,
      height: 72,
      borderRadius: "50%",
      background: "color-mix(in srgb, var(--accent) 15%, var(--surface))",
      border: "2px solid var(--accent)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center"
    }, children: /* @__PURE__ */ jsx(CheckCircle, { size: 36, color: "var(--accent)" }) }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("h2", { style: { fontSize: 26, fontWeight: 700, color: "var(--text)", margin: 0 }, children: "Agent Activated!" }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 15, color: "var(--muted)", marginTop: 8, lineHeight: 1.6 }, children: [
        greeting,
        " agent ",
        /* @__PURE__ */ jsx("strong", { style: { color: "var(--accent)" }, children: profile.agentName }),
        " is now configured and ready to optimize your yield 24/7."
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { style: {
      width: "100%",
      maxWidth: 360,
      background: "var(--surface)",
      borderRadius: 12,
      border: "1px solid var(--border)",
      padding: "16px 20px",
      textAlign: "left"
    }, children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", style: { marginBottom: 12 }, children: [
        /* @__PURE__ */ jsx(Zap, { size: 16, color: "var(--accent)" }),
        /* @__PURE__ */ jsx("span", { style: { fontSize: 13, fontWeight: 600, color: "var(--text)" }, children: "What happens next" })
      ] }),
      [
        "Your agent instruction has been set",
        "Agent will monitor Aave & Morpho every 6h",
        "Automatic rebalancing when better yield found",
        "You can pause or update anytime from dashboard"
      ].map((item, i) => /* @__PURE__ */ jsxs("div", { className: "flex items-start gap-3", style: { marginBottom: i < 3 ? 8 : 0 }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 20,
          height: 20,
          borderRadius: 6,
          flexShrink: 0,
          background: "var(--accent)",
          marginTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff"
        }, children: i + 1 }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)", margin: 0, lineHeight: 1.4 }, children: item })
      ] }, i))
    ] }),
    /* @__PURE__ */ jsxs(
      "a",
      {
        href: "/dashboard",
        className: "d-btn d-btn-primary",
        style: { width: "100%", maxWidth: 360, justifyContent: "center", height: 48, fontSize: 15, textDecoration: "none" },
        children: [
          "Go to Dashboard",
          /* @__PURE__ */ jsx(ArrowRight, { size: 16 })
        ]
      }
    )
  ] });
}

const STEP_LABELS = ["Welcome", "Risk", "Assets", "Target", "Confirm"];
function ProgressBar({ step, total }) {
  return /* @__PURE__ */ jsxs("div", { style: { marginBottom: 32 }, children: [
    /* @__PURE__ */ jsx("div", { className: "flex items-center justify-center gap-2", style: { marginBottom: 12 }, children: STEP_LABELS.map((label, i) => {
      const idx = i + 1;
      const done = idx < step;
      const current = idx === step;
      if (step === 5) return null;
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: current ? 28 : 20,
          height: 20,
          borderRadius: 10,
          background: done ? "var(--accent)" : current ? "var(--accent)" : "var(--surface-2)",
          border: `1px solid ${done || current ? "var(--accent)" : "var(--border)"}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: done || current ? "#fff" : "var(--muted)",
          transition: "all 0.2s ease"
        }, children: done ? "✓" : idx }),
        i < STEP_LABELS.length - 1 && /* @__PURE__ */ jsx("div", { style: {
          width: 24,
          height: 1,
          background: done ? "var(--accent)" : "var(--border)",
          transition: "background 0.2s ease"
        } })
      ] }, label);
    }) }),
    step < 5 && /* @__PURE__ */ jsx("div", { style: { height: 3, background: "var(--border)", borderRadius: 2, overflow: "hidden" }, children: /* @__PURE__ */ jsx("div", { style: {
      height: "100%",
      width: `${(step - 1) / (STEP_LABELS.length - 1) * 100}%`,
      background: "var(--accent)",
      borderRadius: 2,
      transition: "width 0.3s ease"
    } }) })
  ] });
}
function OnboardingContent() {
  const { isDark, toggle } = useTheme();
  const {
    step,
    formData,
    generatedProfile,
    isGenerating,
    isSubmitting,
    error,
    txHash,
    updateForm,
    nextStep,
    prevStep,
    generateProfile,
    confirmAndSave
  } = useOnboarding();
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", background: "var(--bg)", display: "flex", flexDirection: "column" }, children: [
    /* @__PURE__ */ jsxs("div", { style: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 24px",
      borderBottom: "1px solid var(--border)"
    }, children: [
      /* @__PURE__ */ jsxs("a", { href: "/", style: { textDecoration: "none", display: "flex", alignItems: "center", gap: 8 }, children: [
        /* @__PURE__ */ jsx("div", { style: {
          width: 28,
          height: 28,
          borderRadius: 8,
          background: "var(--accent)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 10,
          fontWeight: 700,
          color: "#fff"
        }, children: "YG" }),
        /* @__PURE__ */ jsx("span", { style: { fontWeight: 700, fontSize: 15, color: "var(--text)" }, children: "YieldGuard" })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: toggle,
          "aria-label": "Toggle theme",
          className: "btn-fill-up",
          style: {
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          },
          children: isDark ? /* @__PURE__ */ jsx(Sun, { size: 15 }) : /* @__PURE__ */ jsx(Moon, { size: 15 })
        }
      )
    ] }),
    /* @__PURE__ */ jsx("div", { style: { flex: 1, display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 16px" }, children: /* @__PURE__ */ jsxs("div", { style: {
      width: "100%",
      maxWidth: 520,
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: "32px",
      boxShadow: "var(--shadow)"
    }, children: [
      /* @__PURE__ */ jsx(ProgressBar, { step, total: 5 }),
      step === 1 && /* @__PURE__ */ jsx(
        StepWelcome,
        {
          name: formData.userName ?? "",
          onNameChange: (v) => updateForm({ userName: v }),
          onNext: nextStep
        }
      ),
      step === 2 && /* @__PURE__ */ jsx(
        StepRiskTier,
        {
          value: formData.riskTier,
          onChange: (v) => updateForm({ riskTier: v }),
          onNext: nextStep,
          onBack: prevStep
        }
      ),
      step === 3 && /* @__PURE__ */ jsx(
        StepAssets,
        {
          assets: formData.preferredAssets ?? ["USDC"],
          timeHorizon: formData.timeHorizon,
          onAssetsChange: (v) => updateForm({ preferredAssets: v }),
          onHorizonChange: (v) => updateForm({ timeHorizon: v }),
          onNext: nextStep,
          onBack: prevStep
        }
      ),
      step === 4 && /* @__PURE__ */ jsx(
        StepLimits,
        {
          riskTier: formData.riskTier,
          yieldTarget: formData.yieldTarget,
          onChange: (v) => updateForm({ yieldTarget: v }),
          onNext: (yieldTarget) => generateProfile({ yieldTarget }),
          onBack: prevStep
        }
      ),
      isGenerating && /* @__PURE__ */ jsx("div", { style: {
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0,0,0,0.5)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16
      }, children: /* @__PURE__ */ jsxs("div", { style: {
        background: "var(--surface)",
        borderRadius: 16,
        border: "1px solid var(--border)",
        padding: "32px 40px",
        textAlign: "center"
      }, children: [
        /* @__PURE__ */ jsx("div", { className: "animate-spin", style: {
          width: 40,
          height: 40,
          borderRadius: "50%",
          border: "3px solid var(--border)",
          borderTopColor: "var(--accent)",
          margin: "0 auto 16px"
        } }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 16, fontWeight: 600, color: "var(--text)", margin: 0 }, children: "Generating your AI agent..." }),
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)", marginTop: 6 }, children: "Qwen is analyzing your preferences" })
      ] }) }),
      error && !isGenerating && step === 4 && /* @__PURE__ */ jsx("div", { style: {
        marginTop: 12,
        padding: "10px 14px",
        borderRadius: 8,
        background: "color-mix(in srgb, var(--danger) 10%, var(--surface))",
        border: "1px solid var(--danger)",
        fontSize: 13,
        color: "var(--danger)"
      }, children: error }),
      step === 5 && generatedProfile && /* @__PURE__ */ jsx(
        StepConfirm,
        {
          profile: generatedProfile,
          formData,
          isSubmitting,
          error,
          txHash,
          onConfirm: confirmAndSave,
          onBack: prevStep
        }
      ),
      step === 6 && generatedProfile && /* @__PURE__ */ jsx(StepSuccess, { profile: generatedProfile, userName: formData.userName ?? "" })
    ] }) })
  ] });
}
function OnboardingShellInner() {
  const { isDark } = useTheme();
  return /* @__PURE__ */ jsx(WagmiProvider, { isDark, children: /* @__PURE__ */ jsx(OnboardingContent, {}) });
}
function OnboardingShell() {
  return /* @__PURE__ */ jsx(OnboardingShellInner, {});
}

const $$Onboarding = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "MainLayout", $$MainLayout, { "title": "Setup Your Agent \u2014 DeFAI YieldGuard", "description": "Configure your personalized AI yield agent in 4 steps" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "OnboardingShell", OnboardingShell, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/onboarding/OnboardingShell", "client:component-export": "default" })} ` })}`;
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/onboarding.astro", void 0);

const $$file = "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/onboarding.astro";
const $$url = "/onboarding";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Onboarding,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
