"use client";

import { useState } from "react";
import type { CurrentUser } from "@/lib/auth/session";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children?: React.ReactNode;
  currentUser?: CurrentUser;
}

export function DashboardShell({ children, currentUser }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const sidebarWidth = 260;

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Linke Sidebar – fixed */}
      <div
        className="fixed top-0 left-0 h-screen z-40 transition-all duration-300"
        style={{ width: sidebarOpen ? sidebarWidth : 0, overflow: "hidden" }}
      >
        <Sidebar currentUser={currentUser} />
      </div>

      {/* Rechter Hauptbereich */}
      <div
        className="flex min-h-screen flex-1 flex-col bg-muted/40 transition-[margin,background-color] duration-300"
        style={{ marginLeft: sidebarOpen ? sidebarWidth : 0 }}
      >
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}
