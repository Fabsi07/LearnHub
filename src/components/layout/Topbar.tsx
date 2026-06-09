"use client";

import { Search, PanelLeftClose, PanelLeftOpen, Moon, Sun, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Topbar({ sidebarOpen, onToggleSidebar, darkMode, onToggleDarkMode }: TopbarProps) {
  const router = useRouter();
  const [logoutError, setLogoutError] = useState<string | null>(null);

  async function handleLogout() {
    try {
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (!res.ok) {
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
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-6 py-4">

        {/* Links: Sidebar-Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg hover:bg-black/5 transition-colors text-gray-600"
          title={sidebarOpen ? "Sidebar einklappen" : "Sidebar ausklappen"}
        >
          {sidebarOpen
            ? <PanelLeftClose className="w-5 h-5" />
            : <PanelLeftOpen className="w-5 h-5" />
          }
        </button>

        {/* Mitte: Suchfeld */}
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl"
          style={{ backgroundColor: darkMode ? "#4a4a4a" : "#dcdcdc", width: 280 }}
        >
          <Search className="w-4 h-4" style={{ color: "#9ca3af" }} />
          <span className="text-sm" style={{ color: "#9ca3af" }}>Suchen</span>
        </div>

        {/* Rechts: Dark Mode Toggle + DHBW Icon */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: darkMode ? "#facc15" : "#4b5563" }}
            title={darkMode ? "Light Mode" : "Dark Mode"}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-black/5 transition-colors"
            style={{ color: darkMode ? "#f3f4f6" : "#4b5563" }}
            title="Abmelden"
          >
            <LogOut className="w-5 h-5" />
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

      {/* Fehler beim Logout */}
      {logoutError && (
        <div className="px-6 py-2 text-sm text-red-600 bg-red-50 border-b border-red-200">
          {logoutError}
        </div>
      )}

      {/* Trennlinie */}
      <div style={{ borderBottom: "1px solid #cfcfcf" }} />
    </div>
  );
}
