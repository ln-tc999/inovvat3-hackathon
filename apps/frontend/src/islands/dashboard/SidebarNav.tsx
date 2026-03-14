import { LayoutDashboard, Briefcase, Bot, History, Settings } from "lucide-react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  href: string;
  active?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { icon: <LayoutDashboard size={22} />, label: "Dashboard", href: "/dashboard", active: true },
  { icon: <Briefcase size={22} />,      label: "Portfolio",  href: "/dashboard" },
  { icon: <Bot size={22} />,            label: "Agent",      href: "/dashboard" },
  { icon: <History size={22} />,        label: "History",    href: "/dashboard" },
];

export default function SidebarNav() {
  return (
    <aside
      aria-label="Sidebar navigation"
      style={{ background: "#22223a", width: 96, minHeight: "100vh" }}
      className="fixed left-0 top-0 z-50 hidden lg:flex flex-col items-center py-6 gap-2"
    >
      {/* Logo */}
      <div
        className="mb-6 flex items-center justify-center rounded-full font-bold text-white text-sm"
        style={{
          width: 48, height: 48,
          background: "linear-gradient(135deg, #a78bfa 0%, #5eead4 100%)",
          fontSize: 13, letterSpacing: "0.04em",
        }}
        aria-label="Global AutoYield Agent"
      >
        GAA
      </div>

      {/* Nav icons */}
      <nav className="flex flex-col items-center gap-2 flex-1">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.label}
            href={item.href}
            aria-label={item.label}
            title={item.label}
            className="flex items-center justify-center rounded-xl transition-all duration-200"
            style={{
              width: 48, height: 48,
              background: item.active ? "#a78bfa" : "transparent",
              color: item.active ? "#fff" : "rgba(255,255,255,0.6)",
            }}
            onMouseEnter={(e) => {
              if (!item.active) (e.currentTarget as HTMLElement).style.color = "#fff";
            }}
            onMouseLeave={(e) => {
              if (!item.active) (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)";
            }}
          >
            {item.icon}
          </a>
        ))}
      </nav>

      {/* Settings at bottom */}
      <a
        href="/dashboard"
        aria-label="Settings"
        title="Settings"
        className="flex items-center justify-center rounded-xl transition-all duration-200"
        style={{ width: 48, height: 48, color: "rgba(255,255,255,0.6)" }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.6)"; }}
      >
        <Settings size={22} />
      </a>
    </aside>
  );
}
