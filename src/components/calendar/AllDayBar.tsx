"use client";

import { Star } from "lucide-react";
import type { CalEvent } from "./events";
import { eventOverlapsDay } from "./events";

interface AllDayBarProps {
  days: Date[];
  events: CalEvent[];
  onEventClick?: (event: CalEvent) => void;
}

/**
 * Schmale Zeile über dem Stundenraster für ganztägige / mehrtägige Events
 * (z. B. Feiertage, Ferien). Beeinflusst das Stundenraster nicht und lässt
 * den Tag für Lernzeiten frei.
 */
export function AllDayBar({ days, events, onEventClick }: AllDayBarProps) {
  const allDay = events.filter((e) => e.allDay);
  if (allDay.length === 0) return null;

  return (
    <div className="grid border-b border-gray-200 bg-gray-50/50" style={{ gridTemplateColumns: `64px repeat(${days.length}, 1fr)` }}>
      <div className="border-r border-gray-200 px-2 py-1 text-[10px] uppercase tracking-wider text-gray-500 text-right">
        Ganztägig
      </div>
      {days.map((day, i) => {
        const dayEvents = allDay.filter((e) => eventOverlapsDay(e, day));
        return (
          <div
            key={i}
            className="border-r border-gray-200 last:border-r-0 px-1 py-1 min-h-[28px] space-y-0.5"
          >
            {dayEvents.map((ev) => (
              <button
                key={ev.id}
                type="button"
                title={ev.title}
                onClick={() => onEventClick?.(ev)}
                className={`${ev.color} flex w-full items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight text-white opacity-90 transition-opacity hover:opacity-75 ${
                  ev.important ? "ring-1 ring-amber-300" : ""
                }`}
              >
                {ev.important && (
                  <Star className="h-3 w-3 shrink-0" fill="currentColor" />
                )}
                <span className="truncate">{ev.title}</span>
              </button>
            ))}
          </div>
        );
      })}
    </div>
  );
}
