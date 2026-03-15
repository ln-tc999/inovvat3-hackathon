import { useState, useRef, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Send, Bot, User, Loader2, Zap, Power, PowerOff, AlertTriangle } from "lucide-react";
import { apiClient } from "../lib/api";
import { addHistoryEntry, getRiskProfile } from "../lib/db";
import { WagmiProvider } from "../components/WagmiProvider";
import { useTheme } from "../lib/useTheme";

interface Message {
  id: string;
  role: "user" | "agent";
  content: string;
  meta?: string; // e.g. "APY: 5.2% · Risk: 3/10"
  ts: number;
}

const SUGGESTIONS = [
  "Maximize yield with low risk on stablecoins only",
  "Compound every 6 hours, risk < 5%",
  "Rebalance weekly, preserve principal",
  "Switch to Morpho if APY advantage > 1%",
];

function timeStr(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function AgentChatInner() {
  const { address, isConnected } = useAccount();
  const qc = useQueryClient();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [killConfirm, setKillConfirm] = useState(false);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const { data: profile } = useQuery({
    queryKey: ["risk-profile", address],
    queryFn: () => getRiskProfile(address!),
    enabled: !!address,
  });

  // Seed welcome message once
  useEffect(() => {
    if (messages.length > 0) return;
    const agentName = profile?.agentName ?? "Vatiin AI Agent";
    setMessages([{
      id: "welcome",
      role: "agent",
      content: `Hi! I'm ${agentName}. Tell me how you want to manage your yield — I'll update my strategy and start optimizing.`,
      ts: Date.now(),
    }]);
  }, [profile]);

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMutation = useMutation({
    mutationFn: (instruction: string) =>
      apiClient.setInstruction({ instruction, userAddress: address }),
    onSuccess: async (res, instruction) => {
      const agentMsg: Message = {
        id: crypto.randomUUID(),
        role: "agent",
        content: res.preview,
        meta: `APY target: ${(res.suggestedAPY / 100).toFixed(1)}% · Risk score: ${res.riskScore}/10`,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, agentMsg]);
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "set-instruction",
        reason: res.preview,
        apyBps: res.suggestedAPY,
        profitUSD: 0,
      });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    },
    onError: (err: any) => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "agent",
        content: `Error: ${err?.message ?? "Failed to reach agent. Is the backend running?"}`,
        ts: Date.now(),
      }]);
    },
  });

  const upkeepMutation = useMutation({
    mutationFn: () => apiClient.mockUpkeep(),
    onSuccess: async (res) => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "agent",
        content: `Upkeep complete. ${res.reason}`,
        meta: `New APY: ${(res.newAPY / 100).toFixed(1)}%`,
        ts: Date.now(),
      }]);
      await addHistoryEntry({ timestamp: Date.now(), action: "upkeep", reason: res.reason, apyBps: res.newAPY, profitUSD: 0 });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (active: boolean) => apiClient.pause(active),
    onSuccess: (_, active) => {
      setMessages((prev) => [...prev, {
        id: crypto.randomUUID(),
        role: "agent",
        content: active ? "Agent resumed. I'm back to monitoring your positions." : "Agent paused. I'll stop making changes until you resume me.",
        ts: Date.now(),
      }]);
      qc.invalidateQueries({ queryKey: ["agent-status"] });
    },
  });

  function handleSend() {
    const text = input.trim();
    if (!text || sendMutation.isPending) return;

    const userMsg: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    sendMutation.mutate(text);
  }

  function handleSuggestion(s: string) {
    setInput(s);
    inputRef.current?.focus();
  }

  function handleKill() {
    if (!killConfirm) { setKillConfirm(true); return; }
    pauseMutation.mutate(false);
    setKillConfirm(false);
  }

  if (!isConnected) {
    return (
      <div style={{
        background: "var(--surface)", border: "1px solid var(--border)",
        borderRadius: 20, padding: 32, textAlign: "center",
      }}>
        <Bot size={32} style={{ color: "var(--muted)", margin: "0 auto 12px" }} />
        <p style={{ fontSize: 14, color: "var(--muted)" }}>Connect your wallet to chat with your agent.</p>
      </div>
    );
  }

  return (
    <div style={{
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 20, display: "flex", flexDirection: "column",
      height: 520, overflow: "hidden",
    }}>
      {/* Header */}
      <div style={{
        padding: "14px 20px",
        borderBottom: "1px solid var(--border)",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: "var(--accent)", display: "flex",
            alignItems: "center", justifyContent: "center",
          }}>
            <Bot size={16} color="#fff" />
          </div>
          <div>
            <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)", lineHeight: 1 }}>
              {profile?.agentName ?? "Vatiin AI Agent"}
            </p>
            <p style={{ fontSize: 11, color: status?.active ? "var(--accent-2)" : "var(--muted)", marginTop: 2 }}>
              {status?.active ? "● Active" : "○ Paused"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 6 }}>
          <button
            onClick={() => upkeepMutation.mutate()}
            disabled={upkeepMutation.isPending || !status?.active}
            className="d-btn d-btn-default"
            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
            title="Trigger upkeep cycle"
          >
            {upkeepMutation.isPending ? <Loader2 size={12} className="animate-spin" /> : <Zap size={12} />}
            Upkeep
          </button>
          <button
            onClick={() => pauseMutation.mutate(!status?.active)}
            disabled={pauseMutation.isPending}
            className="d-btn d-btn-default"
            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
          >
            {status?.active ? <PowerOff size={12} /> : <Power size={12} />}
            {status?.active ? "Pause" : "Resume"}
          </button>
          <button
            onClick={handleKill}
            className="d-btn d-btn-danger"
            style={{ height: 32, padding: "0 10px", fontSize: 12 }}
          >
            <AlertTriangle size={12} />
            {killConfirm ? "Confirm" : "Kill"}
          </button>
          {killConfirm && (
            <button
              onClick={() => setKillConfirm(false)}
              style={{ fontSize: 12, color: "var(--muted)", background: "none", border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px", display: "flex", flexDirection: "column", gap: 12 }}>
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
              gap: 8, alignItems: "flex-start",
            }}
          >
            {/* Avatar */}
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: msg.role === "agent" ? "var(--accent)" : "var(--surface-2)",
              border: "1px solid var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              {msg.role === "agent"
                ? <Bot size={14} color="#fff" />
                : <User size={14} style={{ color: "var(--muted)" }} />
              }
            </div>

            {/* Bubble */}
            <div style={{ maxWidth: "75%" }}>
              <div style={{
                padding: "10px 14px", borderRadius: 12,
                background: msg.role === "user" ? "color-mix(in srgb, var(--accent) 10%, var(--surface))" : "var(--surface-2)",
                border: `1px solid ${msg.role === "user" ? "var(--accent)" : "var(--border)"}`,
                fontSize: 13, color: "var(--text)", lineHeight: 1.5,
              }}>
                {msg.content}
              </div>
              {msg.meta && (
                <p style={{ fontSize: 11, color: "var(--accent-2)", marginTop: 4, paddingLeft: 4 }}>
                  {msg.meta}
                </p>
              )}
              <p style={{ fontSize: 10, color: "var(--muted)", marginTop: 3, paddingLeft: 4,
                textAlign: msg.role === "user" ? "right" : "left" }}>
                {timeStr(msg.ts)}
              </p>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {sendMutation.isPending && (
          <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
            <div style={{
              width: 28, height: 28, borderRadius: 8, flexShrink: 0,
              background: "var(--accent)", display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Bot size={14} color="#fff" />
            </div>
            <div style={{
              padding: "10px 14px", borderRadius: 12,
              background: "var(--surface-2)", border: "1px solid var(--border)",
            }}>
              <div style={{ display: "flex", gap: 4, alignItems: "center" }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} style={{
                    width: 6, height: 6, borderRadius: "50%",
                    background: "var(--muted)",
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      <div style={{
        padding: "8px 20px 0",
        display: "flex", gap: 6, flexWrap: "wrap",
        borderTop: "1px solid var(--border)", flexShrink: 0,
      }}>
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            onClick={() => handleSuggestion(s)}
            className="d-badge"
            style={{ cursor: "pointer", fontSize: 11, padding: "3px 10px", transition: "all 0.15s" }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--accent)"; (e.currentTarget as HTMLElement).style.color = "var(--accent)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "var(--border)"; (e.currentTarget as HTMLElement).style.color = "var(--muted)"; }}
          >
            {s.length > 30 ? s.slice(0, 30) + "…" : s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: "10px 20px 16px", flexShrink: 0 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
          <textarea
            ref={inputRef}
            rows={2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
            }}
            placeholder="Tell your agent what to do... (Enter to send)"
            className="d-input"
            style={{ flex: 1, resize: "none", fontSize: 13, padding: "10px 14px" }}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sendMutation.isPending}
            className="d-btn d-btn-primary"
            style={{ height: 52, width: 52, padding: 0, justifyContent: "center", flexShrink: 0 }}
            aria-label="Send message"
          >
            {sendMutation.isPending
              ? <Loader2 size={16} className="animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
}

export default function AgentChat() {
  const { isDark } = useTheme();
  return (
    <WagmiProvider isDark={isDark}>
      <AgentChatInner />
    </WagmiProvider>
  );
}
