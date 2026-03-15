/* empty css                                      */
import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead, m as maybeRenderHead } from '../../chunks/astro/server_BSg5bIr_.mjs';
import { jsxs, jsx } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { u as useTheme, W as WagmiProvider } from '../../chunks/useTheme_Bx62c_5d.mjs';
import { useAccount } from 'wagmi';
import { i as isOnboardingComplete } from '../../chunks/api_BdfuQB5h.mjs';
import { T as TopNavBar } from '../../chunks/TopNavBar_KvQHO2LM.mjs';
import { R as RecentActionsCard, A as ActionHistoryCard } from '../../chunks/RecentActionsCard_xGw-AOvW.mjs';
import { Activity, Clock, BarChart2 } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const STAT_ITEMS = [
  {
    label: "Total Actions",
    value: "128",
    change: "+12 this week",
    icon: Activity
  },
  {
    label: "Last 24h",
    value: "18",
    change: "Mostly compound & rebalance",
    icon: Clock
  },
  {
    label: "Top Action Type",
    value: "Compound",
    change: "42% of all executions",
    icon: BarChart2
  }
];
function HistoryStatsCard() {
  return /* @__PURE__ */ jsxs(
    "section",
    {
      className: "d-card flex flex-col gap-4",
      "aria-label": "Agent history summary statistics",
      children: [
        /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
          /* @__PURE__ */ jsx(
            "p",
            {
              style: {
                fontSize: 16,
                fontWeight: 600,
                color: "var(--text)"
              },
              children: "Activity Snapshot"
            }
          ),
          /* @__PURE__ */ jsx(
            "span",
            {
              className: "d-badge",
              style: {
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: "0.08em"
              },
              children: "Last 7 days"
            }
          )
        ] }),
        /* @__PURE__ */ jsx("div", { className: "grid dash-grid-3 gap-4", children: STAT_ITEMS.map((item) => {
          const Icon = item.icon;
          return /* @__PURE__ */ jsxs(
            "div",
            {
              className: "flex items-start gap-3 rounded-xl",
              style: {
                padding: "10px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)"
              },
              children: [
                /* @__PURE__ */ jsx(
                  "div",
                  {
                    className: "flex items-center justify-center rounded-lg",
                    style: {
                      width: 32,
                      height: 32,
                      background: "rgba(167, 139, 250, 0.1)",
                      color: "var(--accent)",
                      flexShrink: 0
                    },
                    children: /* @__PURE__ */ jsx(Icon, { size: 16, "aria-hidden": "true" })
                  }
                ),
                /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-0.5 min-w-0", children: [
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: 12,
                        textTransform: "uppercase",
                        letterSpacing: "0.08em",
                        color: "var(--muted)",
                        marginBottom: 2
                      },
                      children: item.label
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: 16,
                        fontWeight: 600,
                        color: "var(--text)",
                        lineHeight: 1.2
                      },
                      children: item.value
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "p",
                    {
                      style: {
                        fontSize: 12,
                        color: "var(--muted)",
                        marginTop: 2,
                        whiteSpace: "nowrap",
                        textOverflow: "ellipsis",
                        overflow: "hidden"
                      },
                      children: item.change
                    }
                  )
                ] })
              ]
            },
            item.label
          );
        }) })
      ]
    }
  );
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
function HistoryContent() {
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
  if (!guardChecked) return /* @__PURE__ */ jsx(LoadingScreen, {});
  return /* @__PURE__ */ jsxs("div", { style: { background: "var(--bg)", minHeight: "100vh" }, children: [
    /* @__PURE__ */ jsx(TopNavBar, { isDark, onToggle: toggle }),
    /* @__PURE__ */ jsx("main", { style: { paddingTop: 76 }, "aria-label": "History main content", children: /* @__PURE__ */ jsxs(
      "div",
      {
        style: { maxWidth: 1440, margin: "0 auto", padding: "32px" },
        className: "max-md:px-5 max-sm:px-3",
        children: [
          /* @__PURE__ */ jsxs("div", { style: { marginBottom: 24 }, children: [
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
                children: "History"
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
                children: "Review what your agent has done over time and how actions are distributed."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "grid dash-grid-2 gap-6",
              style: { gridTemplateColumns: "minmax(0, 1.7fr) minmax(0, 1fr)" },
              children: [
                /* @__PURE__ */ jsx(RecentActionsCard, {}),
                /* @__PURE__ */ jsx(ActionHistoryCard, {})
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { style: { marginTop: 24 }, children: /* @__PURE__ */ jsx(HistoryStatsCard, {}) })
        ]
      }
    ) })
  ] });
}
function HistoryShellInner() {
  const { isDark } = useTheme();
  return /* @__PURE__ */ jsx(WagmiProvider, { isDark, children: /* @__PURE__ */ jsx(HistoryContent, {}) });
}
function HistoryShell() {
  return /* @__PURE__ */ jsx(HistoryShellInner, {});
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$History = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="en" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="DeFAI YieldGuard — Agent action history"><title>History — DeFAI YieldGuard</title><script>
      (function () {
        var saved = localStorage.getItem("theme");
        if (saved === "light") document.documentElement.classList.remove("dark");
        else document.documentElement.classList.add("dark");
      })();
    </script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, '<noscript><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript><link rel="stylesheet" href="/src/styles/global.css">', "</head> <body> ", " </body></html>"])), maybeRenderHead(), renderHead(), renderComponent($$result, "HistoryShell", HistoryShell, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/dashboard/HistoryShell", "client:component-export": "default" }));
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/history.astro", void 0);
const $$file = "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/history.astro";
const $$url = "/dashboard/history";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$History,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
