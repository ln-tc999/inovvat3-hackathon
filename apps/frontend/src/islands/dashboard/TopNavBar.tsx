import { useEffect, useState } from "react";
import { Bell, Wallet, Sun, Moon } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getRiskProfile } from "../../lib/db";

const NAV_PILLS: { label: string; href?: string }[] = [
  { label: "Overview", href: "/dashboard" },
  { label: "Portfolio", href: "/dashboard/portfolio" },
  { label: "Agent Controls", href: "/dashboard/agent-controls" },
  { label: "History", href: "/dashboard/history" },
];

interface Props {
  onToggle: () => void;
  isDark: boolean;
}

export default function TopNavBar({ onToggle, isDark }: Props) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  const displayName = profile?.userName?.trim() || null;
  const shortAddr = address
    ? `${address.slice(0, 6)}…${address.slice(-4)}`
    : "";

  const [activePath, setActivePath] = useState<string>("/dashboard");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname || "/dashboard");
    }
  }, []);

  return (
    <header
      aria-label="Top navigation"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      {/* Floating inner — exact same spec as NavBody scrolled state on landing */}
      <div
        style={{
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
          pointerEvents: "auto",
        }}
      >
        {/* Left: brand */}
        <a
          href="/"
          className="flex items-center gap-2 shrink-0"
          aria-label="Go to home"
          style={{ textDecoration: "none" }}
        >
          <div
            style={{
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
              flexShrink: 0,
            }}
            aria-hidden="true"
          >
            GAA
          </div>
          <span style={{ fontWeight: 700, fontSize: 17, color: "var(--text)" }}>
            AutoYield Agent
          </span>
        </a>

        {/* Center: nav items — same style as landing NavItems */}
        <nav
          className="hidden md:flex items-center gap-1"
          aria-label="Dashboard sections"
          style={{ flex: 1, justifyContent: "center" }}
        >
          {NAV_PILLS.map((pill) => {
            const isActive = pill.href
              ? activePath.startsWith(pill.href)
              : false;
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
                border: isActive
                  ? "1px solid var(--border)"
                  : "1px solid transparent",
                cursor: pill.href ? "pointer" : "default",
                opacity: pill.href ? 1 : 0.6,
              } as React.CSSProperties,
              "aria-current": isActive ? ("page" as const) : undefined,
            };

            return pill.href ? (
              <a key={pill.label} href={pill.href} {...commonProps}>
                {pill.label}
              </a>
            ) : (
              <button key={pill.label} type="button" disabled {...commonProps}>
                {pill.label}
              </button>
            );
          })}
        </nav>

        {/* Right: theme toggle + bell + wallet */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            flexShrink: 0,
          }}
        >
          {/* Theme toggle */}
          <button
            onClick={onToggle}
            aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
            className="btn-fill-up"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {/* Bell */}
          <button
            aria-label="Notifications"
            className="btn-fill-up"
            style={{
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <Bell size={16} />
          </button>

          {/* Wallet */}
          {isConnected ? (
            <button
              onClick={() => disconnect()}
              aria-label={`Connected: ${shortAddr}. Click to disconnect.`}
              className="btn-fill-up"
              style={{
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
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 6,
                  background: "var(--accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#fff",
                }}
                aria-hidden="true"
              >
                {displayName ? displayName.slice(0, 2).toUpperCase() : shortAddr.slice(0, 2).toUpperCase()}
              </div>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", lineHeight: 1.2 }}>
                {displayName && (
                  <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>{displayName}</span>
                )}
                <span style={{ fontSize: 11, color: "var(--muted)" }}>{shortAddr}</span>
              </div>
            </button>
          ) : (
            <button
              onClick={() => connect({ connector: connectors[0] })}
              className="d-btn d-btn-default"
              style={{ height: 36, fontSize: 13, borderRadius: 8 }}
              aria-label="Connect wallet"
            >
              <Wallet size={15} />
              Connect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
