"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpen,
  CalendarDays,
  CircleCheckBig,
  ClipboardList,
  Clock,
} from "lucide-react";
import { isLernsessionEvent, type CalEvent } from "@/components/calendar/events";
import type { StudyPlanSummaryDTO } from "@/lib/study-plan/types";
import { cn } from "@/lib/utils";

type ApiEvent = Omit<CalEvent, "start" | "end"> & { start: string; end: string };

function deserialize(events: ApiEvent[]): CalEvent[] {
  return events.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
}

function startOfWeek(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  const wd = out.getDay();
  out.setDate(out.getDate() - (wd === 0 ? 6 : wd - 1));
  return out;
}

function formatDayTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${weekdays[d.getDay()]}, ${pad(d.getDate())}.${pad(d.getMonth() + 1)}. · ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`;
}

export function DashboardContent() {
  const [plans, setPlans] = useState<StudyPlanSummaryDTO[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planRes, eventRes] = await Promise.all([
          fetch("/api/study-plan"),
          fetch("/api/calendar/events"),
        ]);
        const planData = planRes.ok
          ? ((await planRes.json()) as { studyPlans?: StudyPlanSummaryDTO[] })
          : { studyPlans: [] };
        const eventData = eventRes.ok
          ? ((await eventRes.json()) as { events?: ApiEvent[] })
          : { events: [] };
        if (cancelled) return;
        setPlans(planData.studyPlans ?? []);
        setEvents(deserialize(eventData.events ?? []));
      } catch {
        // DB nicht erreichbar → leeres Dashboard
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sessions = useMemo(
    () => events.filter((e) => isLernsessionEvent(e) && e.taskId),
    [events],
  );

  const now = useMemo(() => new Date(), []);
  const weekStart = useMemo(() => startOfWeek(now), [now]);

  const completedSessions = useMemo(
    () =>
      sessions
        .filter((e) => e.taskCompleted)
        .sort((a, b) => b.start.getTime() - a.start.getTime()),
    [sessions],
  );
  const completedThisWeek = completedSessions.filter(
    (e) => e.start.getTime() >= weekStart.getTime(),
  ).length;

  const upcomingSessions = useMemo(
    () =>
      sessions
        .filter((e) => !e.taskCompleted && e.end.getTime() >= now.getTime())
        .sort((a, b) => a.start.getTime() - b.start.getTime())
        .slice(0, 5),
    [sessions, now],
  );

  const openTaskCount = plans.reduce(
    (sum, p) => sum + (p.taskCount - p.completedTaskCount),
    0,
  );

  if (loading) {
    return (
      <div className="flex flex-col p-6 gap-4">
        <div className="h-8 w-48 rounded-lg bg-gray-100 animate-pulse" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
        <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  const stats = [
    {
      label: "Erledigte Lernsessions (diese Woche)",
      value: completedThisWeek,
      icon: CircleCheckBig,
      iconClass: "bg-green-50 text-green-600",
    },
    {
      label: "Offene Aufgaben",
      value: openTaskCount,
      icon: ClipboardList,
      iconClass: "bg-amber-50 text-amber-600",
    },
    {
      label: "Aktive Lernpläne",
      value: plans.length,
      icon: BookOpen,
      iconClass: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      {/* Statistiken */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(({ label, value, icon: Icon, iconClass }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
          >
            <div
              className={cn(
                "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                iconClass,
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Nächste Lernsessions */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Nächste Lernsessions
          </p>
          {upcomingSessions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine anstehenden Lernsessions. Plane einen Lernplan in den Kalender ein.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {upcomingSessions.map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5"
                >
                  <Clock className="h-4 w-4 shrink-0 text-gray-400" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{e.title}</p>
                    <p className="text-xs text-gray-500">{formatDayTime(e.start)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Zuletzt erledigt */}
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Zuletzt erledigt
          </p>
          {completedSessions.length === 0 ? (
            <p className="text-sm text-gray-500">
              Noch keine abgehakten Lernsessions. Erledigte Termine kannst du im Kalender
              abhaken – sie erscheinen dann hier.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {completedSessions.slice(0, 5).map((e) => (
                <div
                  key={e.id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5"
                >
                  <CircleCheckBig className="h-4 w-4 shrink-0 text-green-600" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-400 line-through">
                      {e.title}
                    </p>
                    <p className="text-xs text-gray-500">{formatDayTime(e.start)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lernplan-Fortschritt */}
      <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Lernpläne
        </p>
        {plans.length === 0 ? (
          <p className="text-sm text-gray-500">
            Noch keine Lernpläne.{" "}
            <Link href="/study-plan" className="font-medium text-brand-red hover:underline">
              Lege deinen ersten Lernplan an.
            </Link>
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {plans.map((p) => {
              const progress =
                p.taskCount > 0
                  ? Math.round((p.completedTaskCount / p.taskCount) * 100)
                  : 0;
              return (
                <Link
                  key={p.id}
                  href={`/study-plan/${p.id}`}
                  className="flex items-center gap-4 rounded-xl border border-gray-200 px-4 py-3 transition-colors hover:border-gray-300"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">{p.title}</p>
                    <p className="flex items-center gap-1 text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {p.subject}
                    </p>
                  </div>
                  <div className="flex w-40 shrink-0 items-center gap-2">
                    <div className="h-2 flex-1 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-brand-red transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <span className="w-9 text-right text-xs font-medium text-gray-500">
                      {progress}%
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
