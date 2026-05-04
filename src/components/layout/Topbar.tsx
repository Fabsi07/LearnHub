import { Search, PanelLeftClose, PanelLeftOpen, Moon, Sun } from "lucide-react";
import Image from "next/image";

interface TopbarProps {
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Topbar({ sidebarOpen, onToggleSidebar, darkMode, onToggleDarkMode }: TopbarProps) {
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
          <Image
            src="/images/Dhbw_Icon.png"
            alt="DHBW Logo"
            width={48}
            height={48}
            className="object-contain"
          />
        </div>
      </div>

      {/* Trennlinie */}
      <div style={{ borderBottom: "1px solid #cfcfcf" }} />
    </div>
  );
}
