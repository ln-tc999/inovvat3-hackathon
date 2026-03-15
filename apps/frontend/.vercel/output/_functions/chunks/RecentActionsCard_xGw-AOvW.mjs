import { jsxs, jsx } from 'react/jsx-runtime';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, RefreshCw, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { a as apiClient } from './api_BdfuQB5h.mjs';

const ACTION_DATA = [
  { name: "Compound", value: 42, color: "#a78bfa" },
  { name: "Rebalance", value: 28, color: "#5eead4" },
  { name: "Supply", value: 20, color: "#818cf8" },
  { name: "Withdraw", value: 10, color: "#94a3b8" }
];
const TOTAL = ACTION_DATA.reduce((s, d) => s + d.value, 0);
const HIGHLIGHTS = [
  {
    label: "Last action",
    value: "Compound on Aave v3",
    meta: "5 min ago"
  },
  {
    label: "Largest move",
    value: "Rebalance to Morpho Blue",
    meta: "$2.4k notional"
  },
  {
    label: "Most used pool",
    value: "USDC base pool",
    meta: "68% of cycles"
  }
];
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return /* @__PURE__ */ jsxs(
    "div",
    {
      style: {
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 10,
        padding: "8px 12px",
        fontSize: 12
      },
      children: [
        /* @__PURE__ */ jsx("p", { style: { color: d.payload.color, fontWeight: 600 }, children: d.name }),
        /* @__PURE__ */ jsxs("p", { style: { color: "var(--muted)" }, children: [
          d.value,
          " (",
          Math.round(d.value / TOTAL * 100),
          "%)"
        ] })
      ]
    }
  );
};
function ActionHistoryCard() {
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 18, fontWeight: 700, color: "var(--text)" }, children: "Agent Actions" }),
    /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-5", children: [
      /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            width: 110,
            height: 110,
            position: "relative",
            flexShrink: 0
          },
          role: "img",
          "aria-label": "Donut chart of agent action types",
          children: [
            /* @__PURE__ */ jsx(ResponsiveContainer, { width: "100%", height: "100%", children: /* @__PURE__ */ jsxs(PieChart, { children: [
              /* @__PURE__ */ jsx(
                Pie,
                {
                  data: ACTION_DATA,
                  cx: "50%",
                  cy: "50%",
                  innerRadius: 32,
                  outerRadius: 50,
                  paddingAngle: 3,
                  dataKey: "value",
                  startAngle: 90,
                  endAngle: -270,
                  children: ACTION_DATA.map((e) => /* @__PURE__ */ jsx(Cell, { fill: e.color }, e.name))
                }
              ),
              /* @__PURE__ */ jsx(Tooltip, { content: /* @__PURE__ */ jsx(CustomTooltip, {}) })
            ] }) }),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  position: "absolute",
                  inset: 0,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  pointerEvents: "none"
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "span",
                    {
                      style: { fontSize: 18, fontWeight: 700, color: "var(--text)" },
                      children: TOTAL
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { style: { fontSize: 10, color: "var(--muted)" }, children: "actions" })
                ]
              }
            )
          ]
        }
      ),
      /* @__PURE__ */ jsx("div", { className: "flex flex-col gap-2 flex-1", children: ACTION_DATA.map((d) => {
        const pct = Math.round(d.value / TOTAL * 100);
        return /* @__PURE__ */ jsxs("div", { className: "flex flex-col gap-1", children: [
          /* @__PURE__ */ jsxs("div", { className: "flex items-center justify-between", children: [
            /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2", children: [
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: d.color,
                    display: "inline-block",
                    flexShrink: 0
                  },
                  "aria-hidden": "true"
                }
              ),
              /* @__PURE__ */ jsx("span", { style: { fontSize: 13, color: "var(--muted)" }, children: d.name })
            ] }),
            /* @__PURE__ */ jsx(
              "span",
              {
                style: {
                  fontSize: 13,
                  color: "var(--text)",
                  fontWeight: 500
                },
                children: d.value
              }
            )
          ] }),
          /* @__PURE__ */ jsx("div", { className: "d-progress-track", style: { height: 3 }, children: /* @__PURE__ */ jsx(
            "div",
            {
              style: {
                height: "100%",
                width: `${pct}%`,
                background: d.color,
                borderRadius: 9999
              }
            }
          ) })
        ] }, d.name);
      }) })
    ] }),
    /* @__PURE__ */ jsxs(
      "div",
      {
        className: "flex items-center justify-between mt-1",
        style: { fontSize: 11, color: "var(--muted)" },
        children: [
          /* @__PURE__ */ jsxs("span", { children: [
            "Most frequent: Compound (",
            Math.round(ACTION_DATA[0].value / TOTAL * 100),
            "%)"
          ] }),
          /* @__PURE__ */ jsx("span", { children: "Window: last 30 actions" })
        ]
      }
    ),
    /* @__PURE__ */ jsx(
      "div",
      {
        style: {
          marginTop: 10,
          paddingTop: 10,
          borderTop: "1px solid var(--border)"
        },
        className: "flex flex-col gap-2",
        children: HIGHLIGHTS.map((h) => /* @__PURE__ */ jsxs(
          "div",
          {
            className: "flex items-center justify-between gap-3",
            children: [
              /* @__PURE__ */ jsxs("div", { className: "flex flex-col min-w-0", children: [
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      fontSize: 11,
                      textTransform: "uppercase",
                      letterSpacing: "0.08em",
                      color: "var(--muted)"
                    },
                    children: h.label
                  }
                ),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    style: {
                      fontSize: 13,
                      color: "var(--text)",
                      fontWeight: 500,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis"
                    },
                    children: h.value
                  }
                )
              ] }),
              /* @__PURE__ */ jsx(
                "span",
                {
                  style: {
                    fontSize: 11,
                    color: "var(--muted)",
                    whiteSpace: "nowrap"
                  },
                  children: h.meta
                }
              )
            ]
          },
          h.label
        ))
      }
    )
  ] });
}

const TYPE_COLOR = {
  "Yield Earned": "#5eead4",
  "Rebalance": "#a78bfa",
  "Supply": "#818cf8",
  "Withdraw": "#94a3b8"
};
function timeAgo(ms) {
  const m = Math.floor((Date.now() - ms) / 6e4);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
function RecentActionsCard() {
  const { data } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 3e4
  });
  const lastAt = data?.lastActionAt ?? Date.now() - 36e5;
  const lastAction = data?.lastAction ?? "Switched to Morpho USDC @ 5.1%";
  const apy = data?.currentAPY ?? 480;
  const rows = [
    { icon: /* @__PURE__ */ jsx(TrendingUp, { size: 15 }), name: lastAction.length > 40 ? lastAction.slice(0, 40) + "…" : lastAction, time: timeAgo(lastAt), amount: `+$${(apy / 1e4 * 1500 / 365).toFixed(4)}`, type: "Yield Earned", positive: true },
    { icon: /* @__PURE__ */ jsx(RefreshCw, { size: 15 }), name: "Rebalance USDC → Morpho", time: timeAgo(lastAt + 36e5), amount: "$1,000.00", type: "Rebalance", positive: false },
    { icon: /* @__PURE__ */ jsx(ArrowUpRight, { size: 15 }), name: "Supply DAI to Aave", time: timeAgo(lastAt + 72e5), amount: "$500.00", type: "Supply", positive: false },
    { icon: /* @__PURE__ */ jsx(ArrowDownLeft, { size: 15 }), name: "Compound USDC Yield", time: timeAgo(lastAt + 108e5), amount: "+$0.1240", type: "Yield Earned", positive: true }
  ];
  return /* @__PURE__ */ jsxs("div", { className: "d-card flex flex-col gap-4", children: [
    /* @__PURE__ */ jsx("p", { style: { fontSize: 18, fontWeight: 700, color: "var(--text)" }, children: "Recent On-Chain Actions" }),
    /* @__PURE__ */ jsx("div", { role: "list", "aria-label": "Recent on-chain actions", children: rows.map((row, i) => /* @__PURE__ */ jsxs(
      "div",
      {
        role: "listitem",
        className: "flex items-center gap-3 py-3",
        style: { borderBottom: i < rows.length - 1 ? "1px solid var(--border)" : "none" },
        children: [
          /* @__PURE__ */ jsx("div", { style: {
            width: 34,
            height: 34,
            borderRadius: 10,
            flexShrink: 0,
            background: "var(--surface-2)",
            color: TYPE_COLOR[row.type],
            display: "flex",
            alignItems: "center",
            justifyContent: "center"
          }, "aria-hidden": "true", children: row.icon }),
          /* @__PURE__ */ jsxs("div", { style: { flex: 1, minWidth: 0 }, children: [
            /* @__PURE__ */ jsx("p", { style: { fontSize: 14, color: "var(--text)", fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }, children: row.name }),
            /* @__PURE__ */ jsx("p", { style: { fontSize: 12, color: "var(--muted)", marginTop: 1 }, children: row.time })
          ] }),
          /* @__PURE__ */ jsxs("div", { style: { textAlign: "right", flexShrink: 0 }, children: [
            /* @__PURE__ */ jsx("p", { style: { fontSize: 14, fontWeight: 600, color: row.positive ? "var(--accent-2)" : "var(--text)" }, children: row.amount }),
            /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: TYPE_COLOR[row.type] }, children: row.type })
          ] })
        ]
      },
      i
    )) })
  ] });
}

export { ActionHistoryCard as A, RecentActionsCard as R };
