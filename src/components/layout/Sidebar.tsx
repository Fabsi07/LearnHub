import { LayoutDashboard, Calendar, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";

const navItems = [
  { section: "Learning", items: [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Kalender", href: "/dashboard/calendar", icon: Calendar },
  ]},
  { section: "Access", items: [
    { label: "Nachrichten", href: "/dashboard/messages", icon: MessageSquare },
    { label: "Einstellungen", href: "/dashboard/settings", icon: Settings },
  ]},
];

interface SidebarProps {
  darkMode?: boolean;
}

export function Sidebar({ darkMode }: SidebarProps) {
  const bg = darkMode ? "#2a2a2a" : "#5f6a70";
  return (
    <div
      className="flex flex-col h-full w-full px-5 py-6 transition-colors duration-300"
      style={{ backgroundColor: bg }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 mb-10">
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ backgroundColor: "#ef233c", width: 40, height: 40 }}
        >
          {/* Haus-Icon */}
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: "#ffffff" }}>Learn</span>
          <span style={{ color: "#ef233c" }}>Hub</span>
        </span>
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-8 flex-1">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: "#aeb4b8" }}>
              {section}
            </p>
            <ul className="flex flex-col gap-3">
              {items.map(({ label, href, icon: Icon }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-3 py-2 rounded-xl font-semibold text-sm transition-colors hover:bg-white/10"
                    style={{ color: "#ffffff" }}
                  >
                    <Icon className="w-4 h-4 opacity-80" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Trennlinie */}
      <div className="my-4" style={{ borderTop: "1px solid #7a868c" }} />

      {/* User Card */}
      <div className="flex items-center gap-3">
        <div
          className="flex items-center justify-center rounded-full text-white text-sm font-bold flex-shrink-0"
          style={{ backgroundColor: "#ef233c", width: 38, height: 38 }}
        >
          FP
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Finn Pfleghaar</span>
          <span className="text-xs" style={{ color: "#aeb4b8" }}>finn.pfleghaar@dhbw.de</span>
        </div>
      </div>
    </div>
  );
}
