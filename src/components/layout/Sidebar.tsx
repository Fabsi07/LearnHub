"use client";

import { LayoutDashboard, Calendar, BookOpen, MessageSquare, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LearnHubBrand } from "@/components/brand/LearnHubBrand";
import type { CurrentUser } from "@/lib/auth/session";
import { cn } from "@/lib/utils";

const navItems = [
  {
    section: "Learning",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Lernpläne", href: "/study-plan", icon: BookOpen },
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
  currentUser?: CurrentUser;
}

function getInitials(displayName?: string): string {
  if (!displayName) return "LH";
  const initials = displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
  return initials || "LH";
}

function isActiveLink(currentPath: string, href: string) {
  const target = href.split("?")[0];
  if (target === "/dashboard") {
    return currentPath === "/dashboard";
  }
  return currentPath === target || currentPath.startsWith(`${target}/`);
}

export function Sidebar({ darkMode, currentUser }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const bg = darkMode ? "#2a2a2a" : "#5f6a70";
  const displayName = currentUser?.displayName ?? "LearnHub";
  const email = currentUser?.email ?? "";

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
        <LearnHubBrand
          className="gap-2.5"
          markClassName="h-9 w-12"
          markVariant="plain"
          hubClassName="text-[#ef233c]"
        />
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
          className="flex shrink-0 items-center justify-center overflow-hidden rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: "#ef233c", width: 38, height: 38 }}
        >
          {currentUser?.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={currentUser.avatarUrl}
              alt={displayName}
              className="h-full w-full object-cover"
            />
          ) : (
            getInitials(displayName)
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-white">{displayName}</span>
          <span className="text-xs" style={{ color: "#aeb4b8" }}>
            {email}
          </span>
        </div>
      </Link>
    </div>
  );
}
