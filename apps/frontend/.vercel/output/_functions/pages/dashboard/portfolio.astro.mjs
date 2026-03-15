/* empty css                                      */
import { e as createComponent, r as renderTemplate, k as renderComponent, l as renderHead, m as maybeRenderHead } from '../../chunks/astro/server_BSg5bIr_.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { W as WagmiProvider, u as useTheme } from '../../chunks/useTheme_Bx62c_5d.mjs';
import { useAccount } from 'wagmi';
import { a as apiClient, i as isOnboardingComplete } from '../../chunks/api_BdfuQB5h.mjs';
import { T as TopNavBar } from '../../chunks/TopNavBar_KvQHO2LM.mjs';
import { S as STRINGS, T as TotalPortfolioCard, Y as YieldOverviewCard } from '../../chunks/strings_DNTZfkLZ.mjs';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, RefreshCw, AlertCircle } from 'lucide-react';
export { renderers } from '../../renderers.mjs';

const PROTOCOL_COLORS = {
  Aave: "text-purple-400 bg-purple-900/20 border-purple-800",
  Morpho: "text-blue-400 bg-blue-900/20 border-blue-800"
};
function PortfolioTable({ positions }) {
  if (positions.length === 0) {
    return /* @__PURE__ */ jsxs("div", { className: "text-center py-12 text-slate-500", children: [
      /* @__PURE__ */ jsx(AlertCircle, { size: 32, className: "mx-auto mb-3 opacity-40", "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("p", { children: "No active positions. Set an instruction to start earning." })
    ] });
  }
  return /* @__PURE__ */ jsx("div", { className: "overflow-x-auto -mx-5", children: /* @__PURE__ */ jsxs("table", { className: "w-full text-sm", role: "table", "aria-label": "Portfolio positions", children: [
    /* @__PURE__ */ jsx("thead", { children: /* @__PURE__ */ jsx("tr", { className: "border-b border-slate-200 dark:border-slate-700", children: ["Asset", "Amount", "APY", "Protocol", "Yield Today"].map((h) => /* @__PURE__ */ jsx(
      "th",
      {
        scope: "col",
        className: "px-5 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider",
        children: h
      },
      h
    )) }) }),
    /* @__PURE__ */ jsx("tbody", { className: "divide-y divide-slate-200 dark:divide-slate-700/50", children: positions.map((pos, i) => /* @__PURE__ */ jsxs("tr", { className: "hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors", children: [
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 font-medium text-slate-900 dark:text-white", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { className: "font-semibold", children: pos.symbol }),
        /* @__PURE__ */ jsx("p", { className: "text-xs text-slate-400", children: pos.asset })
      ] }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4 text-slate-700 dark:text-slate-300", children: /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { children: pos.amount.toLocaleString("en-US", { minimumFractionDigits: 2 }) }),
        /* @__PURE__ */ jsxs("p", { className: "text-xs text-slate-400", children: [
          "$",
          pos.amountUSD.toLocaleString("en-US", { minimumFractionDigits: 2 })
        ] })
      ] }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsxs("span", { className: "text-cyan-400 font-semibold", children: [
        (pos.apy / 100).toFixed(2),
        "%"
      ] }) }),
      /* @__PURE__ */ jsx("td", { className: "px-5 py-4", children: /* @__PURE__ */ jsx(
        "span",
        {
          className: `inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${PROTOCOL_COLORS[pos.protocol] ?? ""}`,
          children: pos.protocol
        }
      ) }),
      /* @__PURE__ */ jsxs("td", { className: "px-5 py-4 text-emerald-400 font-medium", children: [
        "+$",
        pos.yieldEarnedToday.toFixed(4)
      ] })
    ] }, i)) })
  ] }) });
}
function PortfolioCardInner() {
  const { data, isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  return /* @__PURE__ */ jsxs("section", { className: "card", "aria-labelledby": "portfolio-heading", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between mb-5", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
        /* @__PURE__ */ jsx(TrendingUp, { size: 18, className: "text-cyan-400", "aria-hidden": "true" }),
        /* @__PURE__ */ jsx("h2", { id: "portfolio-heading", className: "font-semibold text-slate-900 dark:text-white", children: STRINGS.portfolioSection })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          onClick: () => refetch(),
          disabled: isFetching,
          className: "btn-fill-up d-badge",
          style: { cursor: "pointer", padding: "6px 8px" },
          "aria-label": "Refresh portfolio",
          children: /* @__PURE__ */ jsx(RefreshCw, { size: 14, className: isFetching ? "animate-spin" : "", "aria-hidden": "true" })
        }
      )
    ] }),
    isLoading ? /* @__PURE__ */ jsx("div", { className: "space-y-3", "aria-label": "Loading portfolio", "aria-busy": "true", children: [1, 2].map((i) => /* @__PURE__ */ jsx("div", { className: "h-14 bg-slate-100 dark:bg-slate-700/50 rounded-lg animate-pulse" }, i)) }) : isError ? /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 text-red-400 text-sm py-4", children: [
      /* @__PURE__ */ jsx(AlertCircle, { size: 16, "aria-hidden": "true" }),
      STRINGS.errorFetch
    ] }) : /* @__PURE__ */ jsx(PortfolioTable, { positions: data?.portfolio ?? [] })
  ] });
}
function PortfolioCard() {
  return /* @__PURE__ */ jsx(WagmiProvider, { children: /* @__PURE__ */ jsx(PortfolioCardInner, {}) });
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
function PortfolioContent() {
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
    /* @__PURE__ */ jsx("main", { style: { paddingTop: 76 }, "aria-label": "Portfolio main content", children: /* @__PURE__ */ jsxs(
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
                children: "Portfolio"
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
                children: "See all your active positions, APY, and yield breakdown across protocols."
              }
            )
          ] }),
          /* @__PURE__ */ jsxs(
            "div",
            {
              className: "grid dash-grid-2 gap-6",
              style: { gridTemplateColumns: "2fr 1.1fr", marginBottom: 24 },
              children: [
                /* @__PURE__ */ jsx(TotalPortfolioCard, {}),
                /* @__PURE__ */ jsx(YieldOverviewCard, {})
              ]
            }
          ),
          /* @__PURE__ */ jsx("div", { children: /* @__PURE__ */ jsx(PortfolioCard, {}) })
        ]
      }
    ) })
  ] });
}
function PortfolioShellInner() {
  const { isDark } = useTheme();
  return /* @__PURE__ */ jsx(WagmiProvider, { isDark, children: /* @__PURE__ */ jsx(PortfolioContent, {}) });
}
function PortfolioShell() {
  return /* @__PURE__ */ jsx(PortfolioShellInner, {});
}

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const prerender = false;
const $$Portfolio = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate(_a || (_a = __template([`<html lang="en" class="dark"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><meta name="description" content="DeFAI YieldGuard — Portfolio overview"><title>Portfolio — DeFAI YieldGuard</title><script>
      (function () {
        var saved = localStorage.getItem("theme");
        if (saved === "light") document.documentElement.classList.remove("dark");
        else document.documentElement.classList.add("dark");
      })();
    </script><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet" media="print" onload="this.media='all'">`, '<noscript><link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700;900&display=swap" rel="stylesheet"></noscript><link rel="stylesheet" href="/src/styles/global.css">', "</head> <body> ", " </body></html>"])), maybeRenderHead(), renderHead(), renderComponent($$result, "PortfolioShell", PortfolioShell, { "client:load": true, "client:component-hydration": "load", "client:component-path": "/Users/em/web/vatiin-hackathon/apps/frontend/src/islands/dashboard/PortfolioShell", "client:component-export": "default" }));
}, "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/portfolio.astro", void 0);
const $$file = "/Users/em/web/vatiin-hackathon/apps/frontend/src/pages/dashboard/portfolio.astro";
const $$url = "/dashboard/portfolio";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Portfolio,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
