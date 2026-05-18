"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { ListView } from "./ListView";
import {
  formatMonthYear,
  formatWeekRange,
  formatDay,
  getMonthGrid,
  startOfWeek,
} from "./utils";
import { CalEvent, expandRecurring } from "./events";
import { useExternalEvents } from "@/lib/calendar/useExternalEvents";

type View = "month" | "week" | "day" | "list";

interface CalendarProps {
  localEvents: CalEvent[];
  onLocalEventsChange: (next: CalEvent[]) => void;
  onRequestCreate?: (defaults?: { start?: Date; end?: Date }) => void;
}

export function Calendar({
  localEvents,
  onLocalEventsChange,
  onRequestCreate,
}: CalendarProps) {
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const {
    events: externalEvents,
    loading: externalLoading,
    error: externalError,
    refresh: refreshExternal,
  } = useExternalEvents();

  // Sichtbarer Zeitraum je nach View
  function getViewRange(): { start: Date; end: Date } {
    if (view === "month") {
      const grid = getMonthGrid(currentDate);
      const start = new Date(grid[0]);
      start.setHours(0, 0, 0, 0);
      const end = new Date(grid[grid.length - 1]);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (view === "week") {
      const start = startOfWeek(currentDate);
      const end = new Date(start);
      end.setDate(end.getDate() + 6);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    if (view === "day") {
      const start = new Date(currentDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(currentDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    // list: 90 Tage Horizont ab aktuellem Datum
    const start = new Date(currentDate);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + 90);
    return { start, end };
  }

  const range = getViewRange();
  const expandedLocal = expandRecurring(localEvents, range.start, range.end);
  const visibleEvents: CalEvent[] = [...expandedLocal, ...externalEvents];

  function handleEventChange(next: CalEvent) {
    if (next.readOnly) return;
    onLocalEventsChange(localEvents.map((e) => (e.id === next.id ? next : e)));
  }

  function goPrev() {
    const next = new Date(currentDate);
    if (view === "month") next.setMonth(next.getMonth() - 1);
    else if (view === "week") next.setDate(next.getDate() - 7);
    else next.setDate(next.getDate() - 1);
    setCurrentDate(next);
  }

  function goNext() {
    const next = new Date(currentDate);
    if (view === "month") next.setMonth(next.getMonth() + 1);
    else if (view === "week") next.setDate(next.getDate() + 7);
    else next.setDate(next.getDate() + 1);
    setCurrentDate(next);
  }

  function goToday() {
    setCurrentDate(new Date());
  }

  const title =
    view === "month"
      ? formatMonthYear(currentDate)
      : view === "week"
      ? formatWeekRange(currentDate)
      : view === "day"
      ? formatDay(currentDate)
      : "Anstehende Termine";

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <button
            onClick={goToday}
            className="px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Heute
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={goPrev}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Zurück"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={goNext}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Vor"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
          <h2 className="text-xl font-bold text-gray-900 ml-2">{title}</h2>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshExternal(true)}
            disabled={externalLoading}
            title={externalError ? `Sync-Fehler: ${externalError}` : "DHBW-Kalender aktualisieren"}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Externen Kalender aktualisieren"
          >
            <RefreshCw className={`w-4 h-4 ${externalLoading ? "animate-spin" : ""} ${externalError ? "text-red-500" : "text-gray-600"}`} />
          </button>
          <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
          {(["month", "week", "day", "list"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "month"
                ? "Monat"
                : v === "week"
                ? "Woche"
                : v === "day"
                ? "Tag"
                : "Liste"}
            </button>
          ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {view === "month" ? (
          <MonthView currentDate={currentDate} events={visibleEvents} />
        ) : view === "week" ? (
          <WeekView
            currentDate={currentDate}
            events={visibleEvents}
            onEventChange={handleEventChange}
            onRequestCreate={onRequestCreate}
          />
        ) : view === "day" ? (
          <DayView
            currentDate={currentDate}
            events={visibleEvents}
            onEventChange={handleEventChange}
            onRequestCreate={onRequestCreate}
          />
        ) : (
          <ListView currentDate={currentDate} events={visibleEvents} />
        )}
      </div>
    </div>
  );
}
