"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { ListView } from "./ListView";
import { EventDetailModal } from "./EventDetailModal";
import {
  formatMonthYear,
  formatWeekRange,
  formatDay,
  getMonthGrid,
  startOfWeek,
} from "./utils";
import { CalEvent, expandRecurring } from "./events";

type View = "month" | "week" | "day" | "list";

interface CalendarProps {
  localEvents: CalEvent[];
  onLocalEventsChange: (next: CalEvent[]) => void;
  onRequestCreate?: (defaults?: { start?: Date; end?: Date }) => void;
  externalEvents: CalEvent[];
  externalLoading: boolean;
  externalError: string | null;
  refreshExternal: (force?: boolean) => void;
  showExternalEvents: boolean;
  hiddenSubjects: Set<string>;
  showImportantOnly: boolean;
  searchQuery: string;
  typeOptions: string[];
  typeColors: Record<string, string>;
  subjectOptions: string[];
  /** Abhaken einer Lernsession (Events mit verknüpfter Lernplan-Aufgabe). */
  onToggleTaskCompleted?: (event: CalEvent, completed: boolean) => void;
}

export function Calendar({
  localEvents,
  onLocalEventsChange,
  onRequestCreate,
  externalEvents,
  externalLoading,
  externalError,
  refreshExternal,
  showExternalEvents,
  hiddenSubjects,
  showImportantOnly,
  searchQuery,
  typeOptions,
  typeColors,
  subjectOptions,
  onToggleTaskCompleted,
}: CalendarProps) {
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalEvent | null>(null);

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
  const normalizedQuery = searchQuery.trim().toLocaleLowerCase("de-DE");
  const visibleEvents: CalEvent[] = [
    ...expandedLocal,
    ...(showExternalEvents ? externalEvents : []),
  ].filter((ev) => {
    const searchableText = [
      ev.title,
      ev.type,
      ev.subject,
      ev.location,
      ev.notes,
      ev.tasks,
    ]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase("de-DE");
    return (
      ev.end.getTime() >= range.start.getTime() &&
      ev.start.getTime() <= range.end.getTime() &&
      (ev.source !== "local" || !ev.subject || !hiddenSubjects.has(ev.subject)) &&
      (!showImportantOnly || ev.important) &&
      (!normalizedQuery || searchableText.includes(normalizedQuery))
    );
  });

  function handleEventChange(next: CalEvent) {
    if (next.readOnly) return;
    onLocalEventsChange(localEvents.map((e) => (e.id === next.id ? next : e)));
  }

  function handleEventSave(updated: CalEvent) {
    if (updated.readOnly) return;
    const previous = localEvents.find((event) => event.id === updated.id);
    onLocalEventsChange(
      localEvents.map((event) => {
        if (event.id === updated.id) return updated;
        if (
          previous &&
          previous.type === updated.type &&
          previous.color !== updated.color &&
          event.type === updated.type
        ) {
          return { ...event, color: updated.color };
        }
        return event;
      }),
    );
  }

  function handleEventDelete(id: string) {
    onLocalEventsChange(localEvents.filter((e) => e.id !== id));
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
          <MonthView
            currentDate={currentDate}
            events={visibleEvents}
            onEventClick={setSelectedEvent}
          />
        ) : view === "week" ? (
          <WeekView
            currentDate={currentDate}
            events={visibleEvents}
            blockedEvents={externalEvents.filter((e) => e.source === "dhbw")}
            onEventChange={handleEventChange}
            onRequestCreate={onRequestCreate}
            onEventClick={setSelectedEvent}
          />
        ) : view === "day" ? (
          <DayView
            currentDate={currentDate}
            events={visibleEvents}
            blockedEvents={externalEvents.filter((e) => e.source === "dhbw")}
            onEventChange={handleEventChange}
            onRequestCreate={onRequestCreate}
            onEventClick={setSelectedEvent}
          />
        ) : (
          <ListView
            currentDate={currentDate}
            events={visibleEvents}
            onEventClick={setSelectedEvent}
          />
        )}
      </div>

      <EventDetailModal
        event={selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onSave={handleEventSave}
        onDelete={handleEventDelete}
        onToggleTaskCompleted={
          onToggleTaskCompleted
            ? (ev, completed) => {
                onToggleTaskCompleted(ev, completed);
                // Modal zeigt den neuen Status sofort an
                setSelectedEvent({ ...ev, taskCompleted: completed });
              }
            : undefined
        }
        blockedEvents={externalEvents.filter((e) => e.source === "dhbw")}
        typeOptions={typeOptions}
        typeColors={typeColors}
        subjectOptions={subjectOptions}
      />
    </div>
  );
}
