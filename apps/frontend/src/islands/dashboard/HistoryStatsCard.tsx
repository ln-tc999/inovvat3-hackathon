import { Clock, Activity, BarChart2 } from "lucide-react";

const STAT_ITEMS = [
  {
    label: "Total Actions",
    value: "128",
    change: "+12 this week",
    icon: Activity,
  },
  {
    label: "Last 24h",
    value: "18",
    change: "Mostly compound & rebalance",
    icon: Clock,
  },
  {
    label: "Top Action Type",
    value: "Compound",
    change: "42% of all executions",
    icon: BarChart2,
  },
];

export default function HistoryStatsCard() {
  return (
    <section
      className="d-card flex flex-col gap-4"
      aria-label="Agent history summary statistics"
    >
      <div className="flex items-center justify-between">
        <p
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "var(--text)",
          }}
        >
          Activity Snapshot
        </p>
        <span
          className="d-badge"
          style={{
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
          }}
        >
          Last 7 days
        </span>
      </div>

      <div className="grid dash-grid-3 gap-4">
        {STAT_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.label}
              className="flex items-start gap-3 rounded-xl"
              style={{
                padding: "10px 12px",
                background: "var(--surface-2)",
                border: "1px solid var(--border)",
              }}
            >
              <div
                className="flex items-center justify-center rounded-lg"
                style={{
                  width: 32,
                  height: 32,
                  background: "rgba(167, 139, 250, 0.1)",
                  color: "var(--accent)",
                  flexShrink: 0,
                }}
              >
                <Icon size={16} aria-hidden="true" />
              </div>

              <div className="flex flex-col gap-0.5 min-w-0">
                <p
                  style={{
                    fontSize: 12,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    color: "var(--muted)",
                    marginBottom: 2,
                  }}
                >
                  {item.label}
                </p>
                <p
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    color: "var(--text)",
                    lineHeight: 1.2,
                  }}
                >
                  {item.value}
                </p>
                <p
                  style={{
                    fontSize: 12,
                    color: "var(--muted)",
                    marginTop: 2,
                    whiteSpace: "nowrap",
                    textOverflow: "ellipsis",
                    overflow: "hidden",
                  }}
                >
                  {item.change}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
