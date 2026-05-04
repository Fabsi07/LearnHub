"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MonthView } from "./MonthView";
import { WeekView } from "./WeekView";
import { DayView } from "./DayView";
import { formatMonthYear, formatWeekRange, formatDay } from "./utils";
import { CalEvent, getDummyEvents } from "./events";

type View = "month" | "week" | "day";

export function Calendar() {
  const [view, setView] = useState<View>("week");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalEvent[]>(() => getDummyEvents());

  function handleEventChange(next: CalEvent) {
    setEvents((prev) => prev.map((e) => (e.id === next.id ? next : e)));
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
      : formatDay(currentDate);

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
        <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
          {(["month", "week", "day"] as View[]).map((v) => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                view === v
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {v === "month" ? "Monat" : v === "week" ? "Woche" : "Tag"}
            </button>
          ))}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 overflow-auto">
        {view === "month" ? (
          <MonthView currentDate={currentDate} />
        ) : view === "week" ? (
          <WeekView
            currentDate={currentDate}
            events={events}
            onEventChange={handleEventChange}
          />
        ) : (
          <DayView
            currentDate={currentDate}
            events={events}
            onEventChange={handleEventChange}
          />
        )}
      </div>
    </div>
  );
}
