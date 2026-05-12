"use client";

import { LayoutDashboard, Calendar, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "Learning",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Kalender", href: "/calendar", icon: Calendar },
    ],
  },
  {
    section: "Access",
    items: [
      { label: "Benachrichtigungen", href: "/notifications", icon: MessageSquare },
      { label: "Einstellungen", href: "/settings?tab=profile", icon: Settings },
    ],
  },
];

interface SidebarProps {
  darkMode?: boolean;
}

function isActiveLink(currentPath: string, href: string) {
  const target = href.split("?")[0];
  if (target === "/dashboard") {
    return currentPath === "/dashboard";
  }
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function Sidebar({ darkMode }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const bg = darkMode ? "#2a2a2a" : "#5f6a70";

  return (
    <div
      className="flex h-full w-full flex-col px-5 py-6 transition-colors duration-300"
      style={{ backgroundColor: bg }}
    >
      {/* Logo – führt zur Home/Dashboard-Seite */}
      <Link
        href="/dashboard"
        aria-label="Zur Startseite"
        className="mb-10 flex items-center gap-3 rounded-lg transition-colors hover:bg-white/10"
      >
        <div
          className="flex items-center justify-center rounded-xl"
          style={{ backgroundColor: "#ef233c", width: 40, height: 40 }}
        >
          {/* Haus-Icon */}
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
            <polyline points="9 21 9 12 15 12 15 21" />
          </svg>
        </div>
        <span className="text-2xl font-extrabold tracking-tight">
          <span style={{ color: "#ffffff" }}>Learn</span>
          <span style={{ color: "#ef233c" }}>Hub</span>
        </span>
      </Link>

      {/* Navigation */}
      <nav className="flex flex-1 flex-col gap-8">
        {navItems.map(({ section, items }) => (
          <div key={section}>
            <p
              className="mb-3 text-xs font-medium uppercase tracking-wider"
              style={{ color: "#aeb4b8" }}
            >
              {section}
            </p>
            <ul className="flex flex-col gap-3">
              {items.map(({ label, href, icon: Icon }) => {
                const active = isActiveLink(pathname, href);
                return (
                  <li key={label}>
                    <Link
                      href={href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                        active ? "bg-white/15 text-white" : "text-white hover:bg-white/10",
                      )}
                    >
                      <Icon className="h-4 w-4 opacity-80" />
                      {label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Trennlinie */}
      <div className="my-4" style={{ borderTop: "1px solid #7a868c" }} />

      {/* User Card – führt zum Profil-Tab in den Einstellungen */}
      <Link
        href="/settings?tab=profile"
        className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
      >
        <div
          className="flex shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: "#ef233c", width: 38, height: 38 }}
        >
          MM
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">Max Mustermann</span>
          <span className="text-xs" style={{ color: "#aeb4b8" }}>
            demo@learnhub.de
          </span>
        </div>
      </Link>
    </div>
  );
}
