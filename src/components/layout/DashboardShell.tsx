"use client";

import { useEffect, useState } from "react";
import type { CurrentUser } from "@/lib/auth/session";
import { CalendarSearchProvider } from "@/lib/calendar/searchContext";
import {
  EMPTY_NOTIFICATION_SUMMARY,
  summarizeNotifications,
  type NotificationSummary,
} from "@/lib/notifications/summary";
import type { NotificationDTO } from "@/lib/notifications/types";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children?: React.ReactNode;
  currentUser?: CurrentUser;
}

export function DashboardShell({ children, currentUser }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notificationSummary, setNotificationSummary] =
    useState<NotificationSummary>(EMPTY_NOTIFICATION_SUMMARY);
  const sidebarWidth = 260;

  useEffect(() => {
    let cancelled = false;

    async function loadNotificationSummary() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          notifications?: NotificationDTO[];
        };

        if (!response.ok || cancelled) return;
        setNotificationSummary(
          summarizeNotifications(data.notifications ?? []),
        );
      } catch {
        if (!cancelled) setNotificationSummary(EMPTY_NOTIFICATION_SUMMARY);
      }
    }

    loadNotificationSummary();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <CalendarSearchProvider>
      <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
        {/* Linke Sidebar – fixed */}
        <div
          className="fixed top-0 left-0 h-screen z-40 transition-all duration-300"
          style={{ width: sidebarOpen ? sidebarWidth : 0, overflow: "hidden" }}
        >
          <Sidebar
            currentUser={currentUser}
            notificationSummary={notificationSummary}
          />
        </div>

        {/* Rechter Hauptbereich */}
        <div
          className="flex min-h-screen flex-1 flex-col bg-muted/40 transition-[margin,background-color] duration-300"
          style={{ marginLeft: sidebarOpen ? sidebarWidth : 0 }}
        >
          <Topbar
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            notificationSummary={notificationSummary}
          />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </CalendarSearchProvider>
  );
}
