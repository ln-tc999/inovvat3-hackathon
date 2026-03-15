import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Timer, Play, Square, Loader2 } from "lucide-react";
import { apiClient } from "../../../lib/api";
import { addHistoryEntry } from "../../../lib/db";

const INTERVALS = [
  { label: "30s",  value: 30  },
  { label: "1m",   value: 60  },
  { label: "5m",   value: 300 },
];

export default function AgentAutoUpkeep() {
  const qc = useQueryClient();
  const [running, setRunning] = useState(false);
  const [intervalSec, setIntervalSec] = useState(30);
  const [countdown, setCountdown] = useState(30);
  const [runCount, setRunCount] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: status } = useQuery({
    queryKey: ["agent-status"],
    queryFn: () => apiClient.getStatus(),
    refetchInterval: 15_000,
  });

  const upkeepMutation = useMutation({
    mutationFn: () => apiClient.mockUpkeep(),
    onSuccess: async (res) => {
      setRunCount((c) => c + 1);
      await addHistoryEntry({
        timestamp: Date.now(),
        action: "upkeep",
        reason: res.reason,
        apyBps: res.newAPY,
        profitUSD: 0,
      });
      qc.invalidateQueries({ queryKey: ["agent-status"] });
      qc.invalidateQueries({ queryKey: ["history"] });
    },
  });

  function startAuto() {
    if (!status?.active) return;
    setRunning(true);
    setCountdown(intervalSec);

    // Countdown tick
    countdownRef.current = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) return intervalSec;
        return c - 1;
      });
    }, 1000);

    // Upkeep trigger
    timerRef.current = setInterval(() => {
      upkeepMutation.mutate();
      setCountdown(intervalSec);
    }, intervalSec * 1000);
  }

  function stopAuto() {
    setRunning(false);
    if (timerRef.current) clearInterval(timerRef.current);
    if (countdownRef.current) clearInterval(countdownRef.current);
    timerRef.current = null;
    countdownRef.current = null;
  }

  // Stop if agent gets paused externally
  useEffect(() => {
    if (!status?.active && running) stopAuto();
  }, [status?.active]);

  // Cleanup on unmount
  useEffect(() => () => { stopAuto(); }, []);

  const pct = Math.round(((intervalSec - countdown) / intervalSec) * 100);

  return (
    <div className="d-card flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Timer size={16} style={{ color: "var(--accent)" }} />
        <p style={{ fontSize: 16, fontWeight: 700, color: "var(--text)" }}>Auto-Upkeep</p>
        <span className="d-badge" style={{ fontSize: 10, marginLeft: "auto" }}>Chainlink sim</span>
      </div>

      <p style={{ fontSize: 12, color: "var(--muted)", marginTop: -8 }}>
        Simulates Chainlink Automation on testnet. Triggers upkeep at a fixed interval.
      </p>

      {/* Interval selector */}
      <div>
        <p style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
          Interval
        </p>
        <div style={{ display: "flex", gap: 8 }}>
          {INTERVALS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setIntervalSec(opt.value); setCountdown(opt.value); }}
              disabled={running}
              style={{
                flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 13, fontWeight: 600,
                border: `1px solid ${intervalSec === opt.value ? "var(--accent)" : "var(--border)"}`,
                background: intervalSec === opt.value
                  ? "color-mix(in srgb, var(--accent) 10%, var(--surface))"
                  : "var(--surface-2)",
                color: intervalSec === opt.value ? "var(--accent)" : "var(--muted)",
                cursor: running ? "not-allowed" : "pointer",
                opacity: running ? 0.6 : 1,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Countdown ring */}
      {running && (
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ position: "relative", width: 56, height: 56, flexShrink: 0 }}>
            <svg width="56" height="56" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="28" cy="28" r="22" fill="none" stroke="var(--border)" strokeWidth="4" />
              <circle
                cx="28" cy="28" r="22" fill="none"
                stroke="var(--accent)" strokeWidth="4"
                strokeDasharray={`${2 * Math.PI * 22}`}
                strokeDashoffset={`${2 * Math.PI * 22 * (1 - pct / 100)}`}
                strokeLinecap="round"
                style={{ transition: "stroke-dashoffset 0.9s linear" }}
              />
            </svg>
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, fontWeight: 700, color: "var(--text)",
            }}>
              {countdown}s
            </div>
          </div>
          <div>
            <p style={{ fontSize: 13, color: "var(--text)", fontWeight: 600 }}>
              Next upkeep in {countdown}s
            </p>
            <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2 }}>
              {runCount} run{runCount !== 1 ? "s" : ""} completed
              {upkeepMutation.isPending && " · running…"}
            </p>
          </div>
        </div>
      )}

      {/* Start / Stop */}
      <button
        onClick={running ? stopAuto : startAuto}
        disabled={!status?.active && !running}
        className={`d-btn ${running ? "d-btn-danger" : "d-btn-primary"}`}
        style={{ width: "100%", justifyContent: "center" }}
      >
        {upkeepMutation.isPending
          ? <Loader2 size={14} className="animate-spin" />
          : running ? <Square size={14} /> : <Play size={14} />
        }
        {running ? "Stop Auto-Upkeep" : "Start Auto-Upkeep"}
      </button>

      {!status?.active && !running && (
        <p style={{ fontSize: 12, color: "var(--muted)", textAlign: "center" }}>
          Resume agent first to enable auto-upkeep.
        </p>
      )}
    </div>
  );
}
