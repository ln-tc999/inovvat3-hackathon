import { jsxs, jsx } from 'react/jsx-runtime';
import { ArrowUpRight, TrendingUp, ChevronDown } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { a as apiClient, c as addProfitSnapshot, d as getProfitSnapshots } from './api_BdfuQB5h.mjs';
import { useState, useEffect } from 'react';
import { ResponsiveContainer, AreaChart, CartesianGrid, XAxis, YAxis, Tooltip, Area } from 'recharts';

function TotalPortfolioCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  const totalUSD = data?.portfolio?.reduce((s, p) => s + p.amountUSD, 0) ?? 12450;
  const earnedYield = data?.totalProfitUSD ?? 2250;
  const usdcBalance = data?.portfolio?.find((p) => p.symbol === "USDC")?.amountUSD ?? 10200;
  const apy = data?.currentAPY ?? 480;
  const apyPct = (apy / 100).toFixed(1);
  const goalPct = Math.min(100, Math.round(earnedYield / 3e3 * 100));
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-5", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--muted)", fontWeight: 500 }, children: "Total Portfolio Value" }),
      /* @__PURE__ */ jsxs("div", { className: "flex items-end gap-3 mt-1 flex-wrap", children: [
        /* @__PURE__ */ jsxs("span", { style: { fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }, children: [
          "$",
          totalUSD.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
          " USDC"
        ] }),
        /* @__PURE__ */ jsxs("span", { className: "d-badge d-badge-cyan", style: { marginBottom: 4 }, children: [
          /* @__PURE__ */ jsx(ArrowUpRight, { size: 12, "aria-hidden": "true" }),
          apyPct,
          "% APY"
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-3 flex-wrap", children: [
      /* @__PURE__ */ jsxs("button", { className: "d-btn d-btn-default", style: { fontSize: 14 }, children: [
        /* @__PURE__ */ jsx(TrendingUp, { size: 15, "aria-hidden": "true" }),
        "Deposit Stablecoins"
      ] }),
      /* @__PURE__ */ jsx("button", { className: "d-btn d-btn-primary", style: { fontSize: 14 }, children: "Withdraw" })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex gap-8 flex-wrap", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)" }, children: "USDC Balance" }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 16, fontWeight: 600, color: "var(--text)", marginTop: 2 }, children: [
          "$",
          usdcBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 13, color: "var(--muted)" }, children: "Earned Yield" }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 16, fontWeight: 600, color: "var(--accent-2)", marginTop: 2 }, children: [
          "+$",
          earnedYield.toLocaleString("en-US", { minimumFractionDigits: 2 })
        ] })
      ] })
    ] }),
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx("div", { className: "d-progress-track", children: /* @__PURE__ */ jsx("div", { className: "d-progress-fill-purple", style: { width: `${goalPct}%` } }) }),
      /* @__PURE__ */ jsxs("p", { style: { fontSize: 12, color: "var(--muted)", marginTop: 6 }, children: [
        "Yield earned this month — ",
        goalPct,
        "% of monthly goal"
      ] })
    ] })
  ] });
}

function generateMockData(days = 30) {
  const pts = [];
  let cum = 0;
  for (let i = days; i >= 0; i--) {
    const d = /* @__PURE__ */ new Date();
    d.setDate(d.getDate() - i);
    cum += 0.06 + Math.random() * 0.18;
    pts.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      cumYield: parseFloat(cum.toFixed(2)),
      dailyAPY: 420 + Math.floor(Math.random() * 280)
    });
  }
  return pts;
}
const MOCK_DATA = generateMockData();
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return /* @__PURE__ */ jsxs("div", { style: {
    background: "var(--surface)",
    border: "1px solid var(--border)",
    borderRadius: 12,
    padding: "10px 14px",
    fontSize: 12,
    color: "var(--text)"
  }, children: [
    /* @__PURE__ */ jsx("p", { style: { color: "var(--muted)", marginBottom: 4 }, children: label }),
    /* @__PURE__ */ jsxs("p", { style: { color: "var(--accent)" }, children: [
      "Cumulative: $",
      payload[0]?.value?.toFixed(2)
    ] }),
    /* @__PURE__ */ jsxs("p", { style: { color: "var(--accent-2)" }, children: [
      "Daily APY: ",
      ((payload[1]?.value ?? 0) / 100).toFixed(2),
      "%"
    ] })
  ] });
};
function YieldOverviewCard() {
  const [chartData, setChartData] = useState(MOCK_DATA);
  const [range, setRange] = useState("Last 30 Days");
  const [dropOpen, setDropOpen] = useState(false);
  const ranges = ["Last 7 Days", "Last 30 Days", "Last 90 Days"];
  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  useEffect(() => {
    if (!status) return;
    addProfitSnapshot({ date: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10), profitUSD: status.totalProfitUSD, apyBps: status.currentAPY });
  }, [status?.totalProfitUSD]);
  useEffect(() => {
    getProfitSnapshots(30).then((snaps) => {
      if (snaps.length > 3) {
        setChartData(snaps.reverse().map((s) => ({
          date: new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          cumYield: parseFloat(s.profitUSD.toFixed(2)),
          dailyAPY: s.apyBps
        })));
      }
    });
  }, []);
  const avgAPY = status?.currentAPY ?? 480;
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-4", children: [
    /* @__PURE__ */ jsxs("div", { className: "flex items-start justify-between gap-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx("p", { style: { fontSize: 18, fontWeight: 700, color: "var(--text)" }, children: "Yield Performance" }),
        /* @__PURE__ */ jsxs("p", { style: { fontSize: 32, fontWeight: 700, color: "var(--text)", lineHeight: 1.2, marginTop: 4 }, children: [
          (avgAPY / 100).toFixed(1),
          "% Avg APY"
        ] })
      ] }),
      /* @__PURE__ */ jsxs("div", { className: "relative", style: { flexShrink: 0 }, children: [
        /* @__PURE__ */ jsxs(
          "button",
          {
            onClick: () => setDropOpen((v) => !v),
            className: "d-btn d-btn-default",
            style: { height: 34, fontSize: 13, padding: "0 12px" },
            "aria-haspopup": "listbox",
            "aria-expanded": dropOpen,
            children: [
              range,
              /* @__PURE__ */ jsx(ChevronDown, { size: 13, "aria-hidden": "true" })
            ]
          }
        ),
        dropOpen && /* @__PURE__ */ jsx(
          "ul",
          {
            role: "listbox",
            style: {
              position: "absolute",
              right: 0,
              top: "calc(100% + 4px)",
              zIndex: 10,
              background: "var(--surface)",
              border: "1px solid var(--border)",
              borderRadius: 12,
              minWidth: 140,
              overflow: "hidden",
              listStyle: "none",
              margin: 0,
              padding: 0
            },
            children: ranges.map((r) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsx(
              "button",
              {
                role: "option",
                "aria-selected": r === range,
                onClick: () => {
                  setRange(r);
                  setDropOpen(false);
                },
                style: {
                  width: "100%",
                  textAlign: "left",
                  padding: "9px 16px",
                  fontSize: 13,
                  color: r === range ? "var(--accent)" : "var(--muted)",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  transition: "background 0.1s"
                },
                onMouseEnter: (e) => {
                  e.currentTarget.style.background = "var(--surface-2)";
                },
                onMouseLeave: (e) => {
                  e.currentTarget.style.background = "none";
                },
                children: r
              }
            ) }, r))
          }
        )
      ] })
    ] }),
    /* @__PURE__ */ jsx("div", { style: { height: 180 }, role: "img", "aria-label": "Yield performance area chart", children: /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(AreaChart, { data: chartData, margin: { top: 4, right: 4, bottom: 0, left: -20 }, children: [
      /* @__PURE__ */ jsxs("defs", { children: [
        /* @__PURE__ */ jsxs("linearGradient", { id: "gPurple", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#a78bfa", stopOpacity: 0.5 }),
          /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#a78bfa", stopOpacity: 0 })
        ] }),
        /* @__PURE__ */ jsxs("linearGradient", { id: "gCyan", x1: "0", y1: "0", x2: "0", y2: "1", children: [
          /* @__PURE__ */ jsx("stop", { offset: "5%", stopColor: "#5eead4", stopOpacity: 0.5 }),
          /* @__PURE__ */ jsx("stop", { offset: "95%", stopColor: "#5eead4", stopOpacity: 0 })
        ] })
      ] }),
      /* @__PURE__ */ jsx(CartesianGrid, { strokeDasharray: "3 3", stroke: "var(--border)" }),
      /* @__PURE__ */ jsx(XAxis, { dataKey: "date", tick: { fontSize: 11, fill: "var(--muted)" }, tickLine: false, axisLine: false, interval: "preserveStartEnd" }),
      /* @__PURE__ */ jsx(YAxis, { tick: { fontSize: 11, fill: "var(--muted)" }, tickLine: false, axisLine: false }),
      /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "cumYield", stroke: "#a78bfa", strokeWidth: 2, fill: "url(#gPurple)", dot: false, activeDot: { r: 4, fill: "#a78bfa" } }),
      /* @__PURE__ */ jsx(Area, { type: "monotone", dataKey: "dailyAPY", stroke: "#5eead4", strokeWidth: 2, fill: "url(#gCyan)", dot: false, activeDot: { r: 4, fill: "#5eead4" } })
    ] }) }) }),
    /* @__PURE__ */ jsx("div", { className: "flex gap-5", children: [["#a78bfa", "Cumulative Yield"], ["#5eead4", "Daily Earnings"]].map(([color, label]) => /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
      /* @__PURE__ */ jsx("span", { style: { width: 9, height: 9, borderRadius: "50%", background: color, display: "inline-block" }, "aria-hidden": "true" }),
      /* @__PURE__ */ jsx("span", { style: { fontSize: 12, color: "var(--muted)" }, children: label })
    ] }, label)) })
  ] });
}

const STRINGS = {
  portfolioSection: "Current Portfolio",
  // Agent chat
  chatPlaceholder: 'Tell your agent what to do... e.g. "Maximize yield with low risk on stablecoins only"',
  chatSuggestion1: "Maximize yield with low risk on stablecoins only",
  chatSuggestion2: "Compound every 6 hours, risk < 5%",
  chatSuggestion3: "Rebalance weekly, preserve principal",
  errorFetch: "Failed to fetch data"};

export { STRINGS as S, TotalPortfolioCard as T, YieldOverviewCard as Y };
