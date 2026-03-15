import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
import { Sun, Moon, Bell, Wallet } from 'lucide-react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { g as getRiskProfile } from './api_BdfuQB5h.mjs';

const NAV_PILLS = [
  { label: "Overview", href: "/dashboard" },
  { label: "Portfolio", href: "/dashboard/portfolio" },
  { label: "Agent Controls", href: "/dashboard/agent-controls" },
  { label: "History", href: "/dashboard/history" }
];
function TopNavBar({ onToggle, isDark }) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address),
    enabled: !!address
  });
  const displayName = profile?.userName?.trim() || null;
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";
  const [activePath, setActivePath] = useState("/dashboard");
  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname || "/dashboard");
    }
  }, []);
  return /* @__PURE__ */ jsx(
    "header",
    {
      "aria-label": "Top navigation",
      style: {
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        pointerEvents: "none"
      },
      children: /* @__PURE__ */ jsxs(
        "div",
        {
          style: {
            width: "65%",
            minWidth: 720,
            maxWidth: 1152,
            margin: "10px auto 0",
            background: "var(--nav)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
            gap: 16,
            boxShadow: "var(--shadow)",
            pointerEvents: "auto"
          },
          children: [
            /* @__PURE__ */ jsxs(
              "a",
              {
                href: "/",
                className: "flex items-center gap-2 shrink-0",
                "aria-label": "Go to home",
                style: { textDecoration: "none" },
                children: [
                  /* @__PURE__ */ jsx(
                    "div",
                    {
                      style: {
                        width: 32,
                        height: 32,
                        borderRadius: 8,
                        background: "var(--accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 11,
                        fontWeight: 700,
                        color: "#fff",
                        flexShrink: 0
                      },
                      "aria-hidden": "true",
                      children: "GAA"
                    }
                  ),
                  /* @__PURE__ */ jsx("span", { style: { fontWeight: 700, fontSize: 17, color: "var(--text)" }, children: "AutoYield Agent" })
                ]
              }
            ),
            /* @__PURE__ */ jsx(
              "nav",
              {
                className: "hidden md:flex items-center gap-1",
                "aria-label": "Dashboard sections",
                style: { flex: 1, justifyContent: "center" },
                children: NAV_PILLS.map((pill) => {
                  const isActive = pill.href ? activePath.startsWith(pill.href) : false;
                  const commonProps = {
                    className: "btn-fill-up",
                    style: {
                      height: 34,
                      padding: "0 18px",
                      fontSize: 13,
                      fontWeight: 500,
                      letterSpacing: "0.02em",
                      lineHeight: 1,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      whiteSpace: "nowrap",
                      background: "transparent",
                      color: isActive ? "var(--text)" : "var(--muted)",
                      borderRadius: 8,
                      border: isActive ? "1px solid var(--border)" : "1px solid transparent",
                      cursor: pill.href ? "pointer" : "default",
                      opacity: pill.href ? 1 : 0.6
                    },
                    "aria-current": isActive ? "page" : void 0
                  };
                  return pill.href ? /* @__PURE__ */ jsx("a", { href: pill.href, ...commonProps, children: pill.label }, pill.label) : /* @__PURE__ */ jsx("button", { type: "button", disabled: true, ...commonProps, children: pill.label }, pill.label);
                })
              }
            ),
            /* @__PURE__ */ jsxs(
              "div",
              {
                style: {
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexShrink: 0
                },
                children: [
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      onClick: onToggle,
                      "aria-label": isDark ? "Switch to light mode" : "Switch to dark mode",
                      className: "btn-fill-up",
                      style: {
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      },
                      children: isDark ? /* @__PURE__ */ jsx(Sun, { size: 16 }) : /* @__PURE__ */ jsx(Moon, { size: 16 })
                    }
                  ),
                  /* @__PURE__ */ jsx(
                    "button",
                    {
                      "aria-label": "Notifications",
                      className: "btn-fill-up",
                      style: {
                        width: 36,
                        height: 36,
                        borderRadius: 8,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--muted)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer"
                      },
                      children: /* @__PURE__ */ jsx(Bell, { size: 16 })
                    }
                  ),
                  isConnected ? /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => disconnect(),
                      "aria-label": `Connected: ${shortAddr}. Click to disconnect.`,
                      className: "btn-fill-up",
                      style: {
                        height: 36,
                        padding: "0 14px",
                        borderRadius: 8,
                        background: "var(--surface-2)",
                        border: "1px solid var(--border)",
                        color: "var(--text)",
                        fontSize: 13,
                        fontWeight: 500,
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        cursor: "pointer"
                      },
                      children: [
                        /* @__PURE__ */ jsx(
                          "div",
                          {
                            style: {
                              width: 22,
                              height: 22,
                              borderRadius: 6,
                              background: "var(--accent)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: 9,
                              fontWeight: 700,
                              color: "#fff"
                            },
                            "aria-hidden": "true",
                            children: displayName ? displayName.slice(0, 2).toUpperCase() : shortAddr.slice(0, 2).toUpperCase()
                          }
                        ),
                        /* @__PURE__ */ jsxs("div", { style: { display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }, children: [
                          displayName && /* @__PURE__ */ jsx("span", { style: { fontSize: 12, fontWeight: 600, color: "var(--text)" }, children: displayName }),
                          /* @__PURE__ */ jsx("span", { style: { fontSize: 11, color: "var(--muted)" }, children: shortAddr })
                        ] })
                      ]
                    }
                  ) : /* @__PURE__ */ jsxs(
                    "button",
                    {
                      onClick: () => connect({ connector: connectors[0] }),
                      className: "d-btn d-btn-default",
                      style: { height: 36, fontSize: 13, borderRadius: 8 },
                      "aria-label": "Connect wallet",
                      children: [
                        /* @__PURE__ */ jsx(Wallet, { size: 15 }),
                        "Connect"
                      ]
                    }
                  )
                ]
              }
            )
          ]
        }
      )
    }
  );
}

export { TopNavBar as T };
