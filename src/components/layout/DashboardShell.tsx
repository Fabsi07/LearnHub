"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

interface DashboardShellProps {
  children?: React.ReactNode;
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const sidebarWidth = 260;

  const bg = "#e9e9e9";
  const contentBg = "#efefef";

  return (
    <div className="flex min-h-screen transition-colors duration-300" style={{ backgroundColor: bg }}>
      {/* Linke Sidebar – fixed */}
      <div
        className="fixed top-0 left-0 h-screen z-40 transition-all duration-300"
        style={{ width: sidebarOpen ? sidebarWidth : 0, overflow: "hidden" }}
      >
        <Sidebar darkMode={darkMode} />
      </div>

      {/* Rechter Hauptbereich */}
      <div
        className="flex flex-col flex-1 min-h-screen transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? sidebarWidth : 0, backgroundColor: contentBg }}
      >
        <Topbar
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(!darkMode)}
        />
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}
