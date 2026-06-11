"use client";

import { LogOut, Moon, PanelLeftClose, PanelLeftOpen, Search, Sun } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTheme } from "@/lib/useTheme";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export function Topbar({ sidebarOpen, onToggleSidebar }: TopbarProps) {
  const router = useRouter();
  const { isDark, toggleTheme } = useTheme();
  const [logoutError, setLogoutError] = useState<string | null>(null);

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

        <div className="flex w-[280px] items-center gap-2 rounded-2xl bg-muted px-4 py-2 text-muted-foreground">
          <Search className="h-4 w-4" />
          <span className="text-sm">Suchen</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            title={isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
            aria-label={isDark ? "Light Mode aktivieren" : "Dark Mode aktivieren"}
            aria-pressed={isDark}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-amber-400" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
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
  );
}
