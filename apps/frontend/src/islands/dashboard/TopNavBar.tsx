import { Bell, Wallet, Sun, Moon } from "lucide-react";
import { useAccount, useConnect, useDisconnect } from "wagmi";

const NAV_PILLS = ["Overview", "Portfolio", "Agent Controls", "History"];

interface Props {
  onToggle: () => void;
  isDark: boolean;
}

export default function TopNavBar({ onToggle, isDark }: Props) {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const shortAddr = address ? `${address.slice(0, 6)}…${address.slice(-4)}` : "";

  return (
    <header
      aria-label="Top navigation"
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0,
        height: 64,
        zIndex: 50,
        background: "var(--nav)",
        borderBottom: "1px solid var(--border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 32px",
        gap: 16,
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
            width: 32, height: 32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, var(--accent) 0%, var(--accent-2) 100%)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 11, fontWeight: 700, color: "#fff",
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

      {/* Center: nav pills — hidden on small screens */}
      <nav
        className="hidden md:flex items-center gap-1"
        aria-label="Dashboard sections"
        style={{ flex: 1, justifyContent: "center" }}
      >
        {NAV_PILLS.map((pill, i) => (
          <button
            key={pill}
            style={{
              height: 34,
              padding: "0 14px",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: "0.03em",
              background: i === 0 ? "var(--accent)" : "transparent",
              color: i === 0 ? "#fff" : "var(--muted)",
              borderRadius: 9999,
              border: "none",
              cursor: "pointer",
              transition: "background 0.15s, color 0.15s",
            }}
            aria-current={i === 0 ? "page" : undefined}
            onMouseEnter={(e) => {
              if (i !== 0) {
                (e.currentTarget as HTMLElement).style.background = "var(--surface-2)";
                (e.currentTarget as HTMLElement).style.color = "var(--text)";
              }
            }}
            onMouseLeave={(e) => {
              if (i !== 0) {
                (e.currentTarget as HTMLElement).style.background = "transparent";
                (e.currentTarget as HTMLElement).style.color = "var(--muted)";
              }
            }}
          >
            {pill}
          </button>
        ))}
      </nav>

      {/* Right: theme toggle + bell + wallet */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Theme toggle */}
        <button
          onClick={onToggle}
          aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer",
            transition: "color 0.15s, border-color 0.15s",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--accent)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.color = "var(--muted)";
            (e.currentTarget as HTMLElement).style.borderColor = "var(--border)";
          }}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {/* Bell */}
        <button
          aria-label="Notifications"
          style={{
            width: 36, height: 36,
            borderRadius: 10,
            background: "var(--surface-2)",
            border: "1px solid var(--border)",
            color: "var(--muted)",
            display: "flex", alignItems: "center", justifyContent: "center",
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
            style={{
              height: 36,
              padding: "0 14px",
              borderRadius: 9999,
              background: "var(--surface-2)",
              border: "1px solid var(--border)",
              color: "var(--text)",
              fontSize: 13,
              fontWeight: 500,
              display: "flex", alignItems: "center", gap: 8,
              cursor: "pointer",
              transition: "border-color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; }}
          >
            <div
              style={{
                width: 22, height: 22, borderRadius: "50%",
                background: "linear-gradient(135deg, var(--accent), var(--accent-2))",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 9, fontWeight: 700, color: "#fff",
              }}
              aria-hidden="true"
            >
              {shortAddr.slice(0, 2).toUpperCase()}
            </div>
            <span style={{ color: "var(--muted)" }}>{shortAddr}</span>
          </button>
        ) : (
          <button
            onClick={() => connect({ connector: connectors[0] })}
            className="d-btn d-btn-primary"
            style={{ height: 36, fontSize: 13 }}
            aria-label="Connect wallet"
          >
            <Wallet size={15} />
            Connect
          </button>
        )}
      </div>
    </header>
  );
}
