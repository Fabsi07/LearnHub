"use client";

import Link from "next/link";
import {
  BellRing,
  LogOut,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Sun,
  X,
} from "lucide-react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useCalendarSearch } from "@/lib/calendar/searchContext";
import { LanguageSelect } from "@/lib/i18n/LanguageProvider";
import type { NotificationSummary } from "@/lib/notifications/summary";
import { useTheme } from "@/lib/useTheme";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  notificationSummary?: NotificationSummary;
}

function getNotificationTitle(summary: NotificationSummary) {
  if (summary.missedSessionCount > 0) return "Lernsessions verpasst";
  if (summary.urgentCount > 0) return "Wichtige Benachrichtigungen";
  return "Neue Benachrichtigungen";
}

function getNotificationMessage(summary: NotificationSummary) {
  if (summary.missedSessionCount > 0) {
    return `Du hast ${summary.missedSessionCount} Hinweis${
      summary.missedSessionCount === 1 ? "" : "e"
    } zu verpassten Lernsessions. Schau in die Benachrichtigungen, um deinen Lernplan anzupassen.`;
  }

  if (summary.urgentCount > 0) {
    return `Du hast ${summary.urgentCount} wichtige Benachrichtigung${
      summary.urgentCount === 1 ? "" : "en"
    }. Schau sie dir an.`;
  }

  return `Du hast ${summary.openCount} offene Benachrichtigung${
    summary.openCount === 1 ? "" : "en"
  }.`;
}

export function Topbar({
  sidebarOpen,
  onToggleSidebar,
  notificationSummary,
}: TopbarProps) {
  const router = useRouter();
  const pathname = usePathname() ?? "";
  const { isDark, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useCalendarSearch();
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const [notificationPopupDismissed, setNotificationPopupDismissed] =
    useState(false);
  const [mounted, setMounted] = useState(false);
  const openNotificationCount = notificationSummary?.openCount ?? 0;
  const showNotificationPopup =
    openNotificationCount > 0 &&
    !notificationPopupDismissed &&
    pathname !== "/notifications";
  const notificationTitle = notificationSummary
    ? getNotificationTitle(notificationSummary)
    : "";
  const notificationMessage = notificationSummary
    ? getNotificationMessage(notificationSummary)
    : "";
  const showCalendarSearch = pathname === "/calendar";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showCalendarSearch && searchQuery) {
      setSearchQuery("");
    }
  }, [searchQuery, setSearchQuery, showCalendarSearch]);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) {
        setLogoutError("Abmelden fehlgeschlagen. Bitte versuche es erneut.");
        return;
      }
      router.push("/login");
      router.refresh();
    } catch {
      setLogoutError("Abmelden fehlgeschlagen. Bitte versuche es erneut.");
    }
  }

  return (
    <>
      <div className="flex flex-col border-b border-border bg-background/85 backdrop-blur-sm">
        <div className="flex items-center justify-between px-6 py-4">
          <button
            type="button"
            onClick={onToggleSidebar}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={sidebarOpen ? "Sidebar einklappen" : "Sidebar ausklappen"}
            aria-label={sidebarOpen ? "Sidebar einklappen" : "Sidebar ausklappen"}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeftOpen className="h-5 w-5" />
            )}
          </button>

          {showCalendarSearch ? (
            <div className="relative w-[min(360px,42vw)]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Events suchen"
                aria-label="Kalender durchsuchen"
                className="h-10 w-full rounded-2xl border border-transparent bg-muted py-2 pl-10 pr-10 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-brand-red focus:ring-2 focus:ring-brand-red/20 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Suche löschen"
                  title="Suche löschen"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          ) : (
            <div className="w-[min(360px,42vw)]" aria-hidden="true" />
          )}

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title={isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
              aria-label={
                isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"
              }
              aria-pressed={isDark}
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </button>
            <LanguageSelect />
            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Abmelden"
              aria-label="Abmelden"
            >
              <LogOut className="h-5 w-5" />
            </button>
            <Image
              src="/images/Dhbw_Icon.png"
              alt="DHBW Logo"
              width={48}
              height={48}
              className="object-contain"
            />
          </div>
        </div>

        {logoutError && (
          <div className="border-t border-red-200 bg-red-50 px-6 py-2 text-sm text-red-600 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">
            {logoutError}
          </div>
        )}
      </div>

      {mounted &&
        showNotificationPopup &&
        notificationSummary &&
        createPortal(
          <div className="fixed bottom-4 left-4 z-[9999] w-[min(430px,calc(100vw-2rem))] sm:bottom-6 sm:left-6">
            <div
              role="alert"
              aria-labelledby="notification-popup-title"
              className="w-full rounded-xl border border-border bg-card p-4 text-card-foreground shadow-2xl ring-1 ring-black/10 dark:border-white/10 dark:bg-[#242629] dark:text-white dark:ring-white/10"
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ef233c] text-white shadow-sm">
                  <BellRing className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2
                    id="notification-popup-title"
                    className="text-base font-bold leading-6 text-foreground dark:text-white"
                  >
                    {notificationTitle}
                  </h2>
                  <p className="mt-1 text-sm leading-5 text-muted-foreground dark:text-white/75">
                    {notificationMessage}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationPopupDismissed(true)}
                  className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground dark:text-white/60 dark:hover:bg-white/10 dark:hover:text-white"
                  aria-label="Popup schließen"
                  title="Popup schließen"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-4 flex justify-end">
                <Link
                  href="/notifications"
                  onClick={() => setNotificationPopupDismissed(true)}
                  className="rounded-lg bg-[#ef233c] px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#d11f35]"
                >
                  Benachrichtigungen öffnen
                </Link>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
