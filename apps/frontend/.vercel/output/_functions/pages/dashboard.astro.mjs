/* empty css                                   */
import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead, m as maybeRenderHead } from '../chunks/astro/server_BSg5bIr_.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { u as useTheme, W as WagmiProvider } from '../chunks/useTheme_Bx62c_5d.mjs';
import { useAccount } from 'wagmi';
import { useQueryClient, useQuery, useMutation } from '@tanstack/react-query';
import { a as apiClient, g as getRiskProfile, b as addHistoryEntry, i as isOnboardingComplete } from '../chunks/api_BdfuQB5h.mjs';
import { T as TopNavBar } from '../chunks/TopNavBar_KvQHO2LM.mjs';
import { S as STRINGS, T as TotalPortfolioCard, Y as YieldOverviewCard } from '../chunks/strings_DNTZfkLZ.mjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertTriangle, CheckCircle, Loader2, Send, Zap, PowerOff, Power } from 'lucide-react';
import { A as ActionHistoryCard, R as RecentActionsCard } from '../chunks/RecentActionsCard_xGw-AOvW.mjs';
export { renderers } from '../renderers.mjs';

const schema = z.object({ instruction: z.string().min(5, "Too short").max(500) });
const SUGGESTIONS = [STRINGS.chatSuggestion1, STRINGS.chatSuggestion2, STRINGS.chatSuggestion3];
function AgentControlsCard() {
  const { address, isConnected } = useAccount();
  const qc = useQueryClient();
  const [killConfirm, setKillConfirm] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);
  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15e3
  });
  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address),
    enabled: !!address
  });
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { instruction: status?.instruction ?? "" }
  });
  useEffect(() => {
    if (profile?.generatedInstruction && !status?.instruction) {
      setValue("instruction", profile.generatedInstruction);
    }
  }, [profile, status?.instruction]);
  const suggestions = profile ? [profile.generatedInstruction, STRINGS.chatSuggestion2, STRINGS.chatSuggestion3] : SUGGESTIONS;
  const charCount = watch("instruction")?.length ?? 0;
  const instructionMutation = useMutation({
    mutationFn: (d) => apiClient.setInstruction({ instruction: d.instruction, userAddress: address }),
    onSuccess: async (res) => {
      setSuccessMsg(res.preview);
      await addHistoryEntry({ timestamp: Date.now(), action: "set-instruction", reason: res.preview, apyBps: res.suggestedAPY, profitUSD: 0 });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
      setTimeout(() => setSuccessMsg(null), 5e3);
    }
  });
  const pauseMutation = useMutation({
    mutationFn: (active) => apiClient.pause(active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent-status"] })
  });
  const upkeepMutation = useMutation({
    mutationFn: () => apiClient.mockUpkeep(),
    onSuccess: async (res) => {
      await addHistoryEntry({ timestamp: Date.now(), action: "upkeep", reason: res.reason, apyBps: res.newAPY, profitUSD: 0 });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    }
  });
  function handleKill() {
    if (!killConfirm) {
      setKillConfirm(true);
      return;
    }
    pauseMutation.mutate(false);
    setKillConfirm(false);
  }
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", fontWeight: 500 }, children: "AI Agent Status" }),
      /* @__PURE__ */ jsxs("span", { className: `d-badge ${status?.active ? "d-badge-cyan" : "d-badge-red"}`, children: [
        /* @__PURE__ */ jsx("span", { style: {
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: status?.active ? "var(--accent-2)" : "var(--danger)",
          display: "inline-block"
        }, "aria-hidden": "true" }),
        status?.active ? "Active" : "Paused"
      ] })
    ] }),
    isConnected && /* @__PURE__ */ jsx("div", { className: "flex flex-wrap gap-2", role: "group", "aria-label": "Instruction suggestions", children: suggestions.map((s) => /* @__PURE__ */ jsx(
      "button",
      {
        type: "button",
        onClick: () => setValue("instruction", s),
        className: "d-badge d-badge-purple",
        style: { cursor: "pointer", fontSize: 11, transition: "opacity 0.15s" },
        "aria-label": `Use: ${s}`,
        children: s.length > 26 ? s.slice(0, 26) + "…" : s
      },
      s
    )) }),
    isConnected ? /* @__PURE__ */ jsxs("form", { onSubmit: handleSubmit((d) => instructionMutation.mutate(d)), noValidate: true, children: [
      /* @__PURE__ */ jsxs("div", { style: { position: "relative" }, children: [
        /* @__PURE__ */ jsx("label", { htmlFor: "agent-instruction", className: "sr-only", children: "Agent instruction" }),
        /* @__PURE__ */ jsx(
          "textarea",
          {
            id: "agent-instruction",
            rows: 3,
            placeholder: STRINGS.chatPlaceholder,
            className: "d-input",
            "aria-invalid": !!errors.instruction,
            onKeyDown: (e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey))
                handleSubmit((d) => instructionMutation.mutate(d))();
            },
            ...register("instruction")
          }
        ),
        /* @__PURE__ */ jsxs("span", { style: { position: "absolute", bottom: 10, right: 12, fontSize: 11, color: "var(--muted)" }, children: [
          charCount,
          "/500"
        ] })
      ] }),
      errors.instruction && /* @__PURE__ */ jsxs("p", { role: "alert", style: { fontSize: 12, color: "var(--danger)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 12, "aria-hidden": "true" }),
        errors.instruction.message
      ] }),
      successMsg && /* @__PURE__ */ jsxs("p", { role: "status", style: { fontSize: 12, color: "var(--accent-2)", marginTop: 6, display: "flex", alignItems: "center", gap: 4 }, children: [
        /* @__PURE__ */ jsx(CheckCircle, { size: 12, "aria-hidden": "true" }),
        successMsg
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 mt-3", children: [
        /* @__PURE__ */ jsxs("button", { type: "submit", disabled: instructionMutation.isPending, className: "d-btn d-btn-primary", style: { fontSize: 13, height: 38 }, children: [
          instructionMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsx(Send, { size: 14 }),
          "Update"
        ] }),
        /* @__PURE__ */ jsxs(
          "button",
          {
            type: "button",
            onClick: () => upkeepMutation.mutate(),
            disabled: upkeepMutation.isPending || !status?.active,
            className: "d-btn d-btn-default",
            style: { fontSize: 13, height: 38 },
            title: "Simulates Chainlink Automation",
            children: [
              upkeepMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { size: 14, className: "animate-spin" }) : /* @__PURE__ */ jsx(Zap, { size: 14 }),
              "Run Upkeep"
            ]
          }
        )
      ] })
    ] }) : /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)" }, children: "Connect your wallet to configure the agent." }),
    /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2 pt-3", style: { borderTop: "1px solid var(--border)" }, children: [
      /* @__PURE__ */ jsxs(
        "button",
        {
          type: "button",
          onClick: () => pauseMutation.mutate(!status?.active),
          disabled: pauseMutation.isPending,
          className: `d-btn ${status?.active ? "d-btn-default" : "d-btn-primary"}`,
          style: { fontSize: 13, height: 38 },
          children: [
            pauseMutation.isPending ? /* @__PURE__ */ jsx(Loader2, { size: 14, className: "animate-spin" }) : status?.active ? /* @__PURE__ */ jsx(PowerOff, { size: 14 }) : /* @__PURE__ */ jsx(Power, { size: 14 }),
            status?.active ? "Pause" : "Resume"
          ]
        }
      ),
      /* @__PURE__ */ jsxs("button", { type: "button", onClick: handleKill, className: "d-btn d-btn-danger", style: { fontSize: 13, height: 38 }, children: [
        /* @__PURE__ */ jsx(AlertTriangle, { size: 14 }),
        killConfirm ? "Confirm Stop" : "Kill Agent"
      ] }),
      killConfirm && /* @__PURE__ */ jsx(
        "button",
        {
          type: "button",
          onClick: () => setKillConfirm(false),
          style: { fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" },
          children: "Cancel"
        }
      )
    ] }),
    status?.lastAction && /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: "var(--muted)" }, children: [
      "Last: ",
      /* @__PURE__ */ jsx("span", { style: { color: "var(--text)" }, children: status.lastAction })
    ] })
  ] });
}

function RiskLimitCard() {
  const { address } = useAccount();
  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address),
    enabled: !!address
  });
  let riskPct;
  let riskLabel;
  if (profile) {
    riskPct = profile.maxRisk * 10;
    riskLabel = profile.riskTier === "conservative" ? "Low Risk" : profile.riskTier === "moderate" ? "Moderate Risk" : "High Risk";
  } else {
    const instruction = status?.instruction?.toLowerCase() ?? "";
    riskPct = /aggressive|degen|high/.test(instruction) ? 80 : /moderate/.test(instruction) ? 55 : 40;
    riskLabel = riskPct <= 40 ? "Low Risk" : riskPct <= 60 ? "Moderate Risk" : "High Risk";
  }
  const barColor = riskPct <= 40 ? "var(--accent-2)" : riskPct <= 60 ? "var(--accent)" : "var(--danger)";
  const breakdown = [
    { label: "Protocol Risk", pct: Math.round(riskPct * 0.6), color: "var(--accent)" },
    { label: "Liquidity Risk", pct: Math.round(riskPct * 0.3), color: "var(--accent-2)" },
    { label: "Smart Contract", pct: Math.round(riskPct * 0.1), color: "var(--muted)" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", fontWeight: 500 }, children: "Agent Risk Level" }),
      profile && /* @__PURE__ */ jsx("span", { className: "d-badge d-badge-purple", style: { fontSize: 11 }, children: profile.agentName })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-2", children: [
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 28, fontWeight: 700, color: "var(--text)" }, children: [
          riskPct,
          "%"
        ] }),
        /* @__PURE__ */ jsx("span", { className: "d-badge", style: { borderColor: barColor, color: barColor }, children: riskLabel })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "d-progress-track", children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${riskPct}%`, background: barColor, borderRadius: 9999, transition: "width 0.8s ease" } }) }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: "var(--muted)", marginTop: 6 }, children: [
        riskLabel,
        " — ",
        riskPct,
        "% of max risk budget",
        profile && ` · Daily limit $${profile.dailyLimitUSD.toLocaleString()}`
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-3", children: breakdown.map((item) => /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between mb-1", children: [
        /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "var(--muted)" }, children: item.label }),
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: item.color, fontWeight: 500 }, children: [
          item.pct,
          "%"
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "d-progress-track", style: { height: 4 }, children: /* @__PURE__ */ jsx("div", { style: { height: "100%", width: `${item.pct}%`, background: item.color, borderRadius: 9999 } }) })
    ] }, item.label)) })
  ] });
}

function RingProgress({ pct, color, size = 64 }) {
  const r = (size - 10) / 2;
  const circ = 2 * Math.PI * r;
  const dash = pct / 100 * circ;
  return /* @__PURE__ */ jsxs("svg", { width: size, height: size, "aria-hidden": "true", style: { transform: "rotate(-90deg)", flexShrink: 0 }, children: [
    /* @__PURE__ */ jsx("circle", { cx: size / 2, cy: size / 2, r, fill: "none", stroke: "var(--border)", strokeWidth: 6 }),
    /* @__PURE__ */ jsx(
      "circle",
      {
        cx: size / 2,
        cy: size / 2,
        r,
        fill: "none",
        stroke: color,
        strokeWidth: 6,
        strokeDasharray: `${dash} ${circ}`,
        strokeLinecap: "round",
        style: { transition: "stroke-dasharray 0.8s ease" }
      }
    ),
    /* @__PURE__ */ jsxs(
      "text",
      {
        x: "50%",
        y: "50%",
        dominantBaseline: "middle",
        textAnchor: "middle",
        fill: "var(--text)",
        fontSize: 12,
        fontWeight: 700,
        style: { transform: "rotate(90deg)", transformOrigin: "center" },
        children: [
          pct,
          "%"
        ]
      }
    )
  ] });
}
function YieldGoalsCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  const earned = data?.totalProfitUSD ?? 2250;
  const goals = [
    { label: "Monthly Yield 8%", target: 3e3, earned: Math.min(earned, 3e3), deadline: "Mar 31", color: "var(--accent)" },
    { label: "Quarterly Compound", target: 500, earned: Math.min(earned * 0.4, 500), deadline: "Jun 30", color: "var(--accent-2)" },
    { label: "Annual APY 10%", target: 8e3, earned: Math.min(earned * 0.3, 8e3), deadline: "Dec 31", color: "var(--accent)" }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-5", children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 18, fontWeight: 700, color: "var(--text)" }, children: "Yield Goals" }),
    /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-5", children: goals.map((g) => {
      const pct = Math.round(g.earned / g.target * 100);
      return /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-4", children: [
        /* @__PURE__ */ jsx(RingProgress, { pct, color: g.color, size: 60 }),
        /* @__PURE__ */ jsxs("div", { className: "flex-1 min-w-0", children: [
          /* @__PURE__ */ jsx("p", { style: { fontSize: 14, fontWeight: 500, color: "var(--text)" }, children: g.label }),
          /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: "var(--muted)", marginTop: 2 }, children: [
            "Deadline: ",
            g.deadline
          ] }),
          /* @__PURE__ */ jsxs("div", { className: "flex gap-4 mt-1", children: [
            /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: "var(--muted)" }, children: [
              "Earned: ",
              /* @__PURE__ */ jsxs("span", { style: { color: g.color }, children: [
                "$",
                g.earned.toFixed(0)
              ] })
            ] }),
            /* @__PURE__ */ jsxs("span", { style: { fontSize: 12, color: "var(--muted)" }, children: [
              "Target: ",
              /* @__PURE__ */ jsxs("span", { style: { color: "var(--text)" }, children: [
                "$",
                g.target.toLocaleString()
              ] })
            ] })
          ] })
        ] })
      ] }, g.label);
    }) })
  ] });
}

function LoadingScreen() {
  return /* @__PURE__ */ jsxs("div", { style: { minHeight: "100vh", background: "var(--bg)", display: "flex", alignItems: "center", justifyContent: "center" }, children: [
    /* @__PURE__ */ jsxs("div", { style: { textAlign: "center" }, children: [
      /* @__PURE__ */ jsx("div", { style: { width: 36, height: 36, borderRadius: "50%", border: "3px solid var(--border)", borderTopColor: "var(--accent)", margin: "0 auto 12px", animation: "spin 0.8s linear infinite" } }),
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)" }, children: "Loading..." })
    ] }),
    /* @__PURE__ */ jsx("style", { children: `@keyframes spin { to { transform: rotate(360deg); } }` })
  ] });
}
function DashboardContent() {
  const { isDark, toggle } = useTheme();
  const { address, isConnected } = useAccount();
  const [guardChecked, setGuardChecked] = useState(false);
  useEffect(() => {
    if (!isConnected || !address) {
      window.location.href = "/onboarding";
      return;
    }
    isOnboardingComplete(address).then((complete) => {
      if (!complete) window.location.href = "/onboarding";
      else setGuardChecked(true);
    });
  }, [address, isConnected]);
  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address),
    enabled: !!address && guardChecked
  });
  if (!guardChecked) return /* @__PURE__ */ jsx(LoadingScreen, {});
  const greeting = profile?.userName?.trim() ? `Welcome back, ${profile.userName.trim()}` : "Dashboard";
  return /* @__PURE__ */ jsxs("div", { style: { background: "var(--bg)", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsx(TopNavBar, { isDark, onToggle: toggle }),
    /* @__PURE__ */ jsx("main", { style: { paddingTop: 76 }, "aria-label": "Dashboard main content", children: /* @__PURE__ */ jsxs(
      "div",
      {
        style: { maxWidth: 1440, margin: "0 auto", padding: "32px" },
        className: "max-md:px-5 max-sm:px-3",
        children: [
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: 28 }, children: [
            /* @__PURE__ */ jsx(
              "h1",
              {
                style: {
                  fontSize: 28,
                  fontWeight: 700,
                  color: "var(--text)",
                  lineHeight: 1.2,
                  margin: 0
                },
                children: greeting
              }
            ),
            /* @__PURE__ */ jsx(
              "p",
              {
                style: {
                  fontSize: 15,
                  color: "var(--muted)",
                  marginTop: 6,
                  lineHeight: 1.5
                },
                children: "Optimize your crypto yield with autonomous AI agent — set once, earn 24/7"
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { style: { marginBottom: 24 }, children: /* @__PURE__ */ jsx(TotalPortfolioCard, {}) }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "grid dash-grid-2 gap-6",
              style: { gridTemplateColumns: "2fr 1fr", marginBottom: 24 },
              children: [
                /* @__PURE__ */ jsx(YieldOverviewCard, {}),
                /* @__PURE__ */ jsx(AgentControlsCard, {})
              ]
            }
          ),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "grid dash-grid-3 gap-6",
              style: { gridTemplateColumns: "1fr 1fr 1fr", marginBottom: 24 },
              children: [
                /* @__PURE__ */ jsx(RiskLimitCard, {}),
                /* @__PURE__ */ jsx(YieldGoalsCard, {}),
                /* @__PURE__ */ jsx(ActionHistoryCard, {})
              ]
            }
          ),
          /* @__PURE__ */ jsx(RecentActionsCard, {})
        ]
      }
    ) })
  ] });
}
function DashboardShellInner() {
  const { isDark } = useTheme();
  return /* @__PURE__ */ jsx(WagmiProvider, { isDark, children: /* @__PURE__ */ jsx(DashboardContent, {}) });
}
function DashboardShell() {
  return /* @__PURE__ */ jsx(DashboardShellInner, {});
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="en" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="DeFAI YieldGuard — AI Yield Agent Dashboard on Base"><title>Dashboard — DeFAI YieldGuard</title><script>
      (function () {
        var saved = localStorage.getItem("theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        if (saved === "light") document.documentElement.classList.remove("dark");
        else document.documentElement.classList.add("dark");
      })();
    </script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, '<noscript><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript><link rel="stylesheet" href="/src/styles/global.css">', "</head> <body> ", " </body></html>"])), maybeRenderHead(), renderHead(), renderComponent($$result, "DashboardShell", DashboardShell, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/dashboard/DashboardShell", "client:component-export": "default" }));
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/index.astro", void 0);
const $$file = "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/index.astro";
const $$url = "/dashboard";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Index,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
