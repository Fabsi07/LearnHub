"use client";

import { Calendar } from "./Calendar";
import { CalendarSidebar } from "./CalendarSidebar";

export function CalendarPageContent() {
  return (
    <div className="flex h-full overflow-hidden">
      {/* Kalender-Seitenleiste */}
      <CalendarSidebar />

      {/* Kalender-Hauptbereich */}
      <div className="flex-1 p-6 overflow-hidden">
        <Calendar />
      </div>
    </div>
  );
}
