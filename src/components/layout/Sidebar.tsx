"use client";

import {
  LayoutDashboard,
  Calendar,
  BellRing,
  BookOpen,
  MessageSquarePlus,
  Settings,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LearnHubBrand } from "@/components/brand/LearnHubBrand";
import type { CurrentUser } from "@/lib/auth/session";
import type { NotificationSummary } from "@/lib/notifications/summary";
import { cn } from "@/lib/utils";

function getNavItems(canOpenManagement: boolean) {
  return [
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
      { label: "Feedback", href: "/feedback", icon: MessageSquarePlus },
      { label: "Benachrichtigungen", href: "/notifications", icon: BellRing },
      { label: "Einstellungen", href: "/settings?tab=profile", icon: Settings },
    ],
  },
  ...(canOpenManagement
    ? [
        {
          section: "Admin",
          items: [{ label: "Verwaltung", href: "/admin", icon: ShieldCheck }],
        },
      ]
    : []),
  ];
}

interface SidebarProps {
  currentUser?: CurrentUser;
  notificationSummary?: NotificationSummary;
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

export function Sidebar({ currentUser, notificationSummary }: SidebarProps) {
  const pathname = usePathname() ?? "";
  const displayName = currentUser?.displayName ?? "LearnHub";
  const email = currentUser?.email ?? "";
  const navItems = getNavItems(currentUser?.role === "ADMIN" || currentUser?.role === "DEV");
  const openNotificationCount = notificationSummary?.openCount ?? 0;

  return (
    <div className="flex h-full w-full flex-col border-r border-sidebar-border bg-sidebar px-5 py-6 text-sidebar-foreground transition-colors duration-300">
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
            <p className="mb-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/60">
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
                        "flex items-center justify-between gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition-colors",
                        active ? "bg-white/15 text-white" : "text-white hover:bg-white/10",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-3">
                        <Icon className="h-4 w-4 shrink-0 opacity-80" />
                        <span className="truncate">{label}</span>
                      </span>
                      {label === "Benachrichtigungen" && openNotificationCount > 0 && (
                        <span
                          aria-label={`${openNotificationCount} offene Benachrichtigungen`}
                          className="ml-auto inline-flex min-w-5 shrink-0 items-center justify-center rounded-full bg-[#ef233c] px-1.5 py-0.5 text-[11px] font-bold leading-none text-white shadow-sm ring-1 ring-white/20"
                        >
                          {openNotificationCount > 99 ? "99+" : openNotificationCount}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {/* Trennlinie */}
      <div className="my-4 border-t border-sidebar-border" />

      {/* User Card – führt zum Profil-Tab in den Einstellungen */}
      <Link
        href="/settings?tab=profile"
        className="flex min-w-0 items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/10"
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
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="truncate text-sm font-semibold text-white" title={displayName}>
            {displayName}
          </span>
          <span className="truncate text-xs text-sidebar-foreground/60" title={email}>
            {email}
          </span>
        </div>
      </Link>

      {/* Rechtliches */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 px-2 text-[11px] text-sidebar-foreground/50">
        <Link href="/impressum" className="hover:text-white hover:underline">
          Impressum
        </Link>
        <Link href="/datenschutz" className="hover:text-white hover:underline">
          Datenschutz
        </Link>
        <Link href="/nutzungsordnung" className="hover:text-white hover:underline">
          Nutzung
        </Link>
      </div>
    </div>
  );
}
