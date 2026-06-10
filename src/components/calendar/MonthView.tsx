"use client";

import { Star } from "lucide-react";
import { WEEKDAYS, getMonthGrid, isSameDay } from "./utils";
import { CalEvent, eventOnDay, eventOverlapsDay } from "./events";
import { AllDayBackground } from "./AllDayBackground";

interface MonthViewProps {
  currentDate: Date;
  events?: CalEvent[];
  onEventClick?: (event: CalEvent) => void;
}

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MonthView({ currentDate, events = [], onEventClick }: MonthViewProps) {
  const days = getMonthGrid(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col h-full">
      {/* Wochentage Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Tage Grid (6 Wochen × 7 Tage) */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = isSameDay(day, today);
          const dayEvents = events
            .filter((ev) =>
              ev.allDay ? eventOverlapsDay(ev, day) : eventOnDay(ev, day),
            )
            .sort((a, b) => a.start.getTime() - b.start.getTime());
          const visible = dayEvents.slice(0, 3);
          const overflow = dayEvents.length - visible.length;
          return (
            <div
              key={i}
              className={`relative border-r border-b border-gray-200 p-1.5 min-h-[90px] flex flex-col gap-1 transition-colors hover:bg-gray-50 cursor-pointer overflow-hidden ${
                isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <AllDayBackground day={day} events={dayEvents} />
              <div className="relative z-10 flex justify-end">
                <span
                  className={`inline-flex items-center justify-center text-sm rounded-full w-7 h-7 ${
                    isToday
                      ? "bg-brand-red text-white font-bold"
                      : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              {/* Events */}
              <div className="relative z-10 flex flex-col gap-0.5">
                {visible.map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    title={`${ev.title}${ev.allDay ? "" : ` · ${formatTime(ev.start)}`}`}
                    onClick={(e) => { e.stopPropagation(); onEventClick?.(ev); }}
                    className={`flex items-center gap-1 px-1.5 py-0.5 rounded text-[11px] leading-tight text-white truncate w-full text-left cursor-pointer hover:opacity-80 transition-opacity ${ev.color} ${
                      ev.important ? "ring-1 ring-amber-300" : ""
                    }`}
                  >
                    {ev.important && (
                      <Star className="h-3 w-3 shrink-0" fill="currentColor" />
                    )}
                    {!ev.allDay && (
                      <span className="font-medium opacity-90 shrink-0">
                        {formatTime(ev.start)}
                      </span>
                    )}
                    <span className="truncate">{ev.title}</span>
                  </button>
                ))}
                {overflow > 0 && (
                  <span className="text-[10px] text-gray-500 px-1">
                    +{overflow} weitere
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

