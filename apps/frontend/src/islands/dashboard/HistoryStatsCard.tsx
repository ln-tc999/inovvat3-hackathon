import { useQuery } from "@tanstack/react-query";
import { Clock, Activity, TrendingUp } from "lucide-react";
import { getHistory, getAllTxHistory } from "../../lib/db";

export default function HistoryStatsCard() {
  const { data: history } = useQuery({
    queryKey: ["history"],
    queryFn: () => getHistory(200),
    refetchInterval: 15_000,
  });

  const { data: txHistory } = useQuery({
    queryKey: ["tx-history"],
    queryFn: () => getAllTxHistory(200),
    refetchInterval: 15_000,
  });

  const now = Date.now();
  const DAY = 86_400_000;

  const totalActions = (history?.length ?? 0) + (txHistory?.length ?? 0);

  const last24h = [
    ...(history ?? []).filter((h) => now - h.timestamp < DAY),
    ...(txHistory ?? []).filter((t) => now - t.timestamp < DAY),
  ].length;

  // Count action types across both sources
  const counts: Record<string, number> = {};
  (history ?? []).forEach((h) => {
    const k = h.action || "upkeep";
    counts[k] = (counts[k] ?? 0) + 1;
  });
  (txHistory ?? []).forEach((t) => {
    counts[t.type] = (counts[t.type] ?? 0) + 1;
  });

  const topEntry = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
  const topLabel = topEntry
    ? `${topEntry[0].charAt(0).toUpperCase() + topEntry[0].slice(1)} (${Math.round((topEntry[1] / totalActions) * 100)}%)`
    : "—";

  const stats = [
    {
      label: "Total Actions",
      value: totalActions > 0 ? String(totalActions) : "0",
      sub: totalActions > 0 ? `${last24h} in last 24h` : "No actions yet",
      icon: Activity,
    },
    {
      label: "Last 24h",
      value: String(last24h),
      sub: last24h > 0 ? "Recent activity" : "No recent activity",
      icon: Clock,
    },
    {
      label: "Top Action",
      value: topEntry ? topEntry[0].charAt(0).toUpperCase() + topEntry[0].slice(1) : "—",
      sub: topEntry ? `${Math.round((topEntry[1] / totalActions) * 100)}% of all actions` : "No data yet",
      icon: TrendingUp,
    },
  ];

  return (
    <section className="d-card flex flex-col gap-4" aria-label="Agent history summary statistics">
      <div className="flex items-center justify-between">
        <p style={{ fontSize: 16, fontWeight: 600, color: "var(--text)" }}>Activity Snapshot</p>
        <span className="d-badge" style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em" }}>
          All time
        </span>
      </div>

      <div className="grid dash-grid-3 gap-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl"
              style={{ padding: "10px 12px", background: "var(--surface-2)", border: "1px solid var(--border)" }}
            >
              <div style={{
                width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                background: "color-mix(in srgb, var(--accent) 10%, var(--surface))",
                color: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <Icon size={16} aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--muted)", marginBottom: 2 }}>
                  {item.label}
                </p>
                <p style={{ fontSize: 18, fontWeight: 700, color: "var(--text)", lineHeight: 1.2 }}>
                  {item.value}
                </p>
                <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {item.sub}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
