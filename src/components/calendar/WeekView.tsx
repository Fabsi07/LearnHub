"use client";

import { useEffect, useRef, useState } from "react";
import { WEEKDAYS, getWeekDays, isSameDay } from "./utils";
import {
  CalEvent,
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  eventOnDay,
  formatTime,
  layoutDayEvents,
} from "./events";
import { EventBlock } from "./EventBlock";
import { AllDayBar } from "./AllDayBar";
import { AllDayBackground } from "./AllDayBackground";
import { CurrentTimeIndicator } from "./CurrentTimeIndicator";
import { useDragCreate } from "./useDragCreate";

interface WeekViewProps {
  currentDate: Date;
  events: CalEvent[];
  blockedEvents?: CalEvent[];
  onEventChange: (next: CalEvent) => void;
  onRequestCreate?: (defaults: { start: Date; end: Date }) => void;
  onEventClick?: (event: CalEvent) => void;
}

const HOURS = Array.from(
  { length: DAY_END_HOUR - DAY_START_HOUR },
  (_, i) => i + DAY_START_HOUR
);

export function WeekView({ currentDate, events, blockedEvents, onEventChange, onRequestCreate, onEventClick }: WeekViewProps) {
  const days = getWeekDays(currentDate);
  const today = new Date();
  const todayIndex = days.findIndex((day) => isSameDay(day, today));
  const totalHeight = HOURS.length * HOUR_HEIGHT;
  const dhbwEvents = (blockedEvents ?? events).filter((e) => e.source === "dhbw");
  const { onColumnMouseDown, preview } = useDragCreate(onRequestCreate, dhbwEvents);

  // Spaltenbreite messen, damit EventBlock weiß, wie viele px = 1 Tag
  const colRef = useRef<HTMLDivElement>(null);
  const [dayWidth, setDayWidth] = useState(0);
  useEffect(() => {
    if (!colRef.current) return;
    const update = () => setDayWidth(colRef.current?.offsetWidth ?? 0);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(colRef.current);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="flex flex-col h-full">
      {/* Header: Wochentage mit Datum */}
      <div className="grid grid-cols-[64px_repeat(7,1fr)] border-b border-gray-200 sticky top-0 bg-white z-10">
        <div className="border-r border-gray-200" />
        {days.map((day, i) => {
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className="px-3 py-2 text-center border-r border-gray-200 last:border-r-0"
            >
              <div className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                {WEEKDAYS[i]}
              </div>
              <div
                className={`mt-1 inline-flex items-center justify-center w-8 h-8 rounded-full text-sm ${
                  isToday ? "bg-brand-red text-white font-bold" : "text-gray-900"
                }`}
              >
                {day.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* All-Day-Leiste (Feiertage, Ferien, mehrtägige Events) */}
      <AllDayBar days={days} events={events} onEventClick={onEventClick} />

      {/* Body: Zeit-Spalte + 7 Tages-Spalten */}
      <div className="relative grid grid-cols-[64px_repeat(7,1fr)]">
        {todayIndex >= 0 && (
          <CurrentTimeIndicator
            day={days[todayIndex]}
            dayIndex={todayIndex}
            dayCount={days.length}
          />
        )}
        {/* Zeit-Spalte */}
        <div className="border-r border-gray-200" style={{ height: totalHeight }}>
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="px-2 pt-0 text-xs text-gray-500 text-right leading-none"
              style={{ height: HOUR_HEIGHT }}
            >
              {hour}:00
            </div>
          ))}
        </div>

        {/* Tages-Spalten */}
        {days.map((day, di) => {
          const dayEvents = events.filter((e) => !e.allDay && eventOnDay(e, day));
          const laidOut = layoutDayEvents(dayEvents);
          const showPreview = preview && isSameDay(preview.day, day);
          return (
            <div
              key={di}
              ref={di === 0 ? colRef : undefined}
              onMouseDown={(e) => onColumnMouseDown(e, day)}
              className="relative border-r border-gray-200 last:border-r-0 cursor-crosshair select-none"
              style={{ height: totalHeight }}
            >
              {/* Stunden-Linien */}
              {HOURS.map((hour) => (
                <div
                  key={hour}
                  className="border-b border-gray-200 hover:bg-gray-50/60 transition-colors"
                  style={{ height: HOUR_HEIGHT }}
                />
              ))}
              <AllDayBackground day={day} events={events} />
              {/* Drag-Create Preview */}
              {showPreview && (
                <div
                  className="absolute left-1 right-1 rounded-md bg-brand-red/20 border-2 border-brand-red pointer-events-none flex items-center justify-center text-[11px] font-semibold text-brand-red"
                  style={{ top: preview!.top, height: preview!.height }}
                >
                  {formatTime(preview!.start)} – {formatTime(preview!.end)}
                </div>
              )}
              {/* Events */}
              {laidOut.map(({ event: ev, column, columns }) => (
                <EventBlock
                  key={ev.id}
                  event={ev}
                  onChange={onEventChange}
                  dayWidth={dayWidth}
                  column={column}
                  columns={columns}
                  blockedEvents={dhbwEvents}
                  onEventClick={onEventClick}
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
