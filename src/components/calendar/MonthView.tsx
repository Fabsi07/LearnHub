"use client";

import { useEffect, useState } from "react";
import { ChevronRight, Star, X } from "lucide-react";
import { AllDayBackground } from "./AllDayBackground";
import { CalEvent, eventOnDay, eventOverlapsDay } from "./events";
import { WEEKDAYS, getMonthGrid, isSameDay } from "./utils";

interface MonthViewProps {
  currentDate: Date;
  events?: CalEvent[];
  onEventClick?: (event: CalEvent) => void;
}

interface ExpandedDay {
  day: Date;
  events: CalEvent[];
}

function formatTime(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatDay(day: Date): string {
  return new Intl.DateTimeFormat("de-DE", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(day);
}

export function MonthView({
  currentDate,
  events = [],
  onEventClick,
}: MonthViewProps) {
  const [expandedDay, setExpandedDay] = useState<ExpandedDay | null>(null);
  const days = getMonthGrid(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  useEffect(() => {
    if (!expandedDay) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setExpandedDay(null);
    }

    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [expandedDay]);

  function openEvent(event: CalEvent) {
    setExpandedDay(null);
    onEventClick?.(event);
  }

  return (
    <>
      <div className="flex h-full flex-col">
        <div className="grid grid-cols-7 border-b border-gray-200">
          {WEEKDAYS.map((weekday) => (
            <div
              key={weekday}
              className="px-3 py-2 text-center text-xs font-semibold uppercase tracking-wider text-gray-500"
            >
              {weekday}
            </div>
          ))}
        </div>

        <div className="grid flex-1 grid-cols-7 grid-rows-6">
          {days.map((day) => {
            const isCurrentMonth = day.getMonth() === currentMonth;
            const isToday = isSameDay(day, today);
            const dayEvents = events
              .filter((event) =>
                event.allDay
                  ? eventOverlapsDay(event, day)
                  : eventOnDay(event, day),
              )
              .sort((left, right) => left.start.getTime() - right.start.getTime());
            const visibleEvents = dayEvents.slice(0, 3);
            const overflowCount = dayEvents.length - visibleEvents.length;

            return (
              <div
                key={day.toISOString()}
                className={`relative flex min-h-[90px] cursor-pointer flex-col gap-1 overflow-hidden border-r border-b border-gray-200 p-1.5 transition-colors hover:bg-gray-50 ${
                  isCurrentMonth ? "bg-white" : "bg-gray-50/50"
                }`}
              >
                <AllDayBackground day={day} events={dayEvents} />
                <div className="relative z-10 flex justify-end">
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                      isToday
                        ? "bg-brand-red font-bold text-white"
                        : isCurrentMonth
                          ? "text-gray-900"
                          : "text-gray-400"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <div className="relative z-10 flex flex-col gap-0.5">
                  {visibleEvents.map((event) => (
                    <button
                      key={event.id}
                      type="button"
                      title={`${event.title}${
                        event.allDay ? "" : ` · ${formatTime(event.start)}`
                      }`}
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        onEventClick?.(event);
                      }}
                      className={`flex w-full cursor-pointer items-center gap-1 truncate rounded px-1.5 py-0.5 text-left text-[11px] leading-tight text-white transition-opacity hover:opacity-80 ${event.color} ${
                        event.important ? "ring-1 ring-amber-300" : ""
                      }`}
                    >
                      {event.important && (
                        <Star className="h-3 w-3 shrink-0" fill="currentColor" />
                      )}
                      {!event.allDay && (
                        <span className="shrink-0 font-medium opacity-90">
                          {formatTime(event.start)}
                        </span>
                      )}
                      <span className="truncate">{event.title}</span>
                    </button>
                  ))}

                  {overflowCount > 0 && (
                    <button
                      type="button"
                      onClick={(clickEvent) => {
                        clickEvent.stopPropagation();
                        setExpandedDay({
                          day: new Date(day),
                          events: dayEvents,
                        });
                      }}
                      className="w-fit rounded px-1 text-left text-[10px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                      aria-label={`Alle ${dayEvents.length} Termine am ${formatDay(day)} anzeigen`}
                    >
                      +{overflowCount} weitere
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {expandedDay && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4"
          role="presentation"
          onClick={(event) => {
            if (event.target === event.currentTarget) setExpandedDay(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="month-day-events-title"
            className="flex max-h-[80vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {expandedDay.events.length} Termine
                </p>
                <h2
                  id="month-day-events-title"
                  className="text-lg font-bold capitalize text-gray-900"
                >
                  {formatDay(expandedDay.day)}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setExpandedDay(null)}
                className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
                aria-label="Terminliste schließen"
              >
                <X className="h-5 w-5" />
              </button>
            </header>

            <div className="min-h-0 space-y-2 overflow-y-auto p-4">
              {expandedDay.events.map((event) => (
                <button
                  key={event.id}
                  type="button"
                  onClick={() => openEvent(event)}
                  className="group flex w-full cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 text-left transition-all duration-150 hover:-translate-y-px hover:border-brand-red/40 hover:bg-red-50/40 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-red/40"
                >
                  <span
                    className={`mt-1 h-3 w-3 shrink-0 rounded-full ${event.color}`}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                      {event.important && (
                        <Star
                          className="h-3.5 w-3.5 shrink-0 text-amber-500"
                          fill="currentColor"
                        />
                      )}
                      <span className="truncate">{event.title}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">
                      {event.allDay
                        ? "Ganztägig"
                        : `${formatTime(event.start)} - ${formatTime(event.end)}`}
                      {event.location ? ` · ${event.location}` : ""}
                    </span>
                  </span>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 translate-x-1 text-gray-400 opacity-0 transition-all group-hover:translate-x-0 group-hover:text-brand-red group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:text-brand-red group-focus-visible:opacity-100"
                    aria-hidden="true"
                  />
                </button>
              ))}
            </div>
          </section>
        </div>
      )}
    </>
  );
}
