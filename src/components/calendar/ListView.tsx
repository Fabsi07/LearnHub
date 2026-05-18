"use client";

import { CalendarDays, MapPin } from "lucide-react";
import { CalEvent } from "./events";
import { MONTHS, WEEKDAYS, isSameDay } from "./utils";

interface ListViewProps {
  events: CalEvent[];
  currentDate: Date;
}

function formatTimeRange(ev: CalEvent): string {
  if (ev.allDay) return "Ganztägig";
  const fmt = (d: Date) =>
    `${d.getHours().toString().padStart(2, "0")}:${d
      .getMinutes()
      .toString()
      .padStart(2, "0")}`;
  return `${fmt(ev.start)} – ${fmt(ev.end)}`;
}

function formatDayHeading(day: Date, today: Date): string {
  const weekdayLong = [
    "Sonntag",
    "Montag",
    "Dienstag",
    "Mittwoch",
    "Donnerstag",
    "Freitag",
    "Samstag",
  ][day.getDay()];
  const base = `${weekdayLong}, ${day.getDate()}. ${MONTHS[day.getMonth()]} ${day.getFullYear()}`;
  if (isSameDay(day, today)) return `Heute · ${base}`;
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (isSameDay(day, tomorrow)) return `Morgen · ${base}`;
  return base;
}

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export function ListView({ events, currentDate }: ListViewProps) {
  const from = new Date(currentDate);
  from.setHours(0, 0, 0, 0);

  // Anstehende Events ab dem aktuellen Datum, chronologisch
  const upcoming = events
    .filter((ev) => ev.end.getTime() >= from.getTime())
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  // Gruppieren nach Tag (anhand des Startdatums; mehrtägige Events erscheinen nur am Starttag)
  const groups = new Map<string, { day: Date; items: CalEvent[] }>();
  for (const ev of upcoming) {
    const day = new Date(ev.start);
    day.setHours(0, 0, 0, 0);
    // Wenn Event vor `from` startet, aber noch läuft → unter `from` einsortieren
    const bucketDay = day.getTime() < from.getTime() ? from : day;
    const key = dayKey(bucketDay);
    if (!groups.has(key)) groups.set(key, { day: bucketDay, items: [] });
    groups.get(key)!.items.push(ev);
  }

  const sortedGroups = Array.from(groups.values()).sort(
    (a, b) => a.day.getTime() - b.day.getTime(),
  );

  const today = new Date();

  if (sortedGroups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 py-16">
        <CalendarDays className="w-12 h-12 mb-3 text-gray-300" />
        <p className="text-sm">Keine anstehenden Termine.</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {sortedGroups.map(({ day, items }) => (
        <section key={dayKey(day)} className="px-6 py-4">
          <div className="flex items-baseline gap-3 mb-3">
            <div className="flex flex-col items-center justify-center w-12 h-12 rounded-lg bg-gray-50 border border-gray-200 shrink-0">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                {WEEKDAYS[(day.getDay() + 6) % 7]}
              </span>
              <span className="text-lg font-bold text-gray-900 leading-none">
                {day.getDate()}
              </span>
            </div>
            <h3 className="text-sm font-semibold text-gray-700">
              {formatDayHeading(day, today)}
            </h3>
          </div>

          <ul className="space-y-2 ml-15 pl-0">
            {items.map((ev) => (
              <li
                key={ev.id}
                className="flex items-start gap-3 p-3 rounded-lg border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                <span
                  className={`mt-1 w-1 self-stretch rounded-full ${ev.color}`}
                  aria-hidden
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-gray-900 truncate">
                      {ev.title}
                    </p>
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeRange(ev)}
                    </span>
                  </div>
                  {ev.location ? (
                    <div className="mt-1 flex items-center gap-1 text-xs text-gray-500">
                      <MapPin className="w-3 h-3" />
                      <span className="truncate">{ev.location}</span>
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
