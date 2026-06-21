"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  AlertTriangle,
  BookOpen,
  CalendarClock,
  CalendarDays,
  CircleCheckBig,
  ClipboardList,
  Clock,
  Plus,
} from "lucide-react";
import {
  eventOverlapsDay,
  expandRecurring,
  isLernsessionEvent,
  type CalEvent,
} from "@/components/calendar/events";
import { isOpenTaskOverdue } from "@/lib/study-plan/dueDates";
import type { StudyPlanSummaryDTO } from "@/lib/study-plan/types";
import { cn } from "@/lib/utils";

type ApiEvent = Omit<CalEvent, "start" | "end"> & { start: string; end: string };

type DashboardTask = {
  id: string;
  title: string;
  dueDate: Date;
  overdue: boolean;
  studyPlanId: string;
  studyPlanTitle: string;
  subject: string;
};

const MAX_DASHBOARD_ITEMS = 5;

function deserialize(events: ApiEvent[]): CalEvent[] {
  return events.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
}

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function startOfWeek(d: Date): Date {
  const out = startOfDay(d);
  const wd = out.getDay();
  out.setDate(out.getDate() - (wd === 0 ? 6 : wd - 1));
  return out;
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function formatDate(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDayTime(d: Date): string {
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  return `${weekdays[d.getDay()]}, ${formatDate(d)} um ${formatTime(d)} Uhr`;
}

function formatTaskDueDate(d: Date, today: Date, tomorrow: Date): string {
  if (isSameDay(d, today)) return "Heute fällig";
  if (isSameDay(d, tomorrow)) return "Morgen fällig";
  return `Fällig am ${formatDate(d)}`;
}

function formatEventTime(event: CalEvent): string {
  if (event.allDay) return "Ganztägig";
  if (isSameDay(event.start, event.end)) {
    return `${formatTime(event.start)}-${formatTime(event.end)} Uhr`;
  }
  return `${formatDayTime(event.start)} bis ${formatDayTime(event.end)}`;
}

function sortEventsByStart(a: CalEvent, b: CalEvent): number {
  const timeDiff = a.start.getTime() - b.start.getTime();
  if (timeDiff !== 0) return timeDiff;
  return a.title.localeCompare(b.title, "de");
}

function isActivePlan(plan: StudyPlanSummaryDTO, today: Date): boolean {
  const openTaskCount = plan.taskCount - plan.completedTaskCount;
  if (openTaskCount > 0) return true;
  const targetDate = new Date(plan.targetDate);
  return plan.taskCount === 0 && startOfDay(targetDate).getTime() >= today.getTime();
}

export function DashboardContent() {
  const [plans, setPlans] = useState<StudyPlanSummaryDTO[]>([]);
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [planRes, eventRes, externalEventRes] = await Promise.all([
          fetch("/api/study-plan"),
          fetch("/api/calendar/events"),
          fetch("/api/calendar/external"),
        ]);
        const planData = planRes.ok
          ? ((await planRes.json()) as { studyPlans?: StudyPlanSummaryDTO[] })
          : { studyPlans: [] };
        const eventData = eventRes.ok
          ? ((await eventRes.json()) as { events?: ApiEvent[] })
          : { events: [] };
        const externalEventData = externalEventRes.ok
          ? ((await externalEventRes.json()) as { events?: ApiEvent[] })
          : { events: [] };
        if (cancelled) return;
        setPlans(planData.studyPlans ?? []);
        setEvents([
          ...deserialize(eventData.events ?? []),
          ...deserialize(externalEventData.events ?? []),
        ]);
      } catch {
        // DB oder externer Kalender nicht erreichbar -> leeres Dashboard statt Crash.
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = useMemo(() => new Date(), []);
  const today = useMemo(() => startOfDay(now), [now]);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const afterTomorrow = useMemo(() => addDays(today, 2), [today]);
  const weekStart = useMemo(() => startOfWeek(now), [now]);

  const sessions = useMemo(
    () => events.filter((e) => isLernsessionEvent(e) && e.taskId),
    [events],
  );

  const completedThisWeek = useMemo(
    () =>
      sessions.filter(
        (e) => e.taskCompleted && e.start.getTime() >= weekStart.getTime(),
      ).length,
    [sessions, weekStart],
  );

  const openTasks = useMemo<DashboardTask[]>(
    () =>
      plans
        .flatMap((plan) =>
          plan.openTasks.map((task) => ({
            id: task.id,
            title: task.title,
            dueDate: new Date(task.dueDate),
            overdue: isOpenTaskOverdue(
              { completed: false, dueDate: task.dueDate },
              today,
            ),
            studyPlanId: plan.id,
            studyPlanTitle: plan.title,
            subject: plan.subject,
          })),
        )
        .sort((a, b) => {
          const dateDiff = a.dueDate.getTime() - b.dueDate.getTime();
          if (dateDiff !== 0) return dateDiff;
          return a.title.localeCompare(b.title, "de");
        }),
    [plans, today],
  );

  const visibleOpenTasks = openTasks.slice(0, MAX_DASHBOARD_ITEMS);

  const expandedEvents = useMemo(
    () => expandRecurring(events, today, afterTomorrow),
    [events, today, afterTomorrow],
  );

  const todayEvents = useMemo(
    () =>
      expandedEvents
        .filter((event) => eventOverlapsDay(event, today))
        .sort(sortEventsByStart)
        .slice(0, MAX_DASHBOARD_ITEMS),
    [expandedEvents, today],
  );

  const tomorrowEvents = useMemo(
    () =>
      expandedEvents
        .filter((event) => eventOverlapsDay(event, tomorrow))
        .sort(sortEventsByStart)
        .slice(0, MAX_DASHBOARD_ITEMS),
    [expandedEvents, tomorrow],
  );

  const activePlans = useMemo(
    () => plans.filter((plan) => isActivePlan(plan, today)),
    [plans, today],
  );
  const visibleActivePlans = activePlans.slice(0, MAX_DASHBOARD_ITEMS);

  const openTaskCount = openTasks.length;

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-6">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-gray-100" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-24 animate-pulse rounded-2xl bg-gray-100" />
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-2xl bg-gray-100" />
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
      value: activePlans.length,
      icon: BookOpen,
      iconClass: "bg-blue-50 text-blue-600",
    },
  ];

  return (
    <div className="flex h-full flex-col gap-5 overflow-auto p-6">
      <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Nächste offene Aufgaben
            </p>
            <Link href="/study-plan" className="text-xs font-medium text-brand-red hover:underline">
              Alle Lernpläne
            </Link>
          </div>
          {visibleOpenTasks.length === 0 ? (
            <p className="text-sm text-gray-500">
              Keine offenen Aufgaben. Sobald du Aufgaben anlegst, erscheinen die nächsten hier.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {visibleOpenTasks.map((task) => (
                <Link
                  key={task.id}
                  href={`/study-plan/${task.studyPlanId}`}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-2.5 transition-colors",
                    task.overdue
                      ? "border-red-200 bg-red-50/70 hover:border-red-300 dark:border-red-500/40 dark:bg-red-950/30 dark:hover:border-red-400/70"
                      : "border-gray-200 hover:border-gray-300 dark:border-white/10 dark:hover:border-white/20",
                  )}
                >
                  {task.overdue ? (
                    <AlertTriangle className="h-4 w-4 shrink-0 text-red-600 dark:text-red-300" />
                  ) : (
                    <ClipboardList className="h-4 w-4 shrink-0 text-amber-500 dark:text-amber-300" />
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                      {task.title}
                    </p>
                    <p
                      className={cn(
                        "truncate text-xs",
                        task.overdue
                          ? "font-medium text-red-700 dark:text-red-300"
                          : "text-gray-500 dark:text-white/60",
                      )}
                    >
                      {task.subject} ·{" "}
                      {task.overdue
                        ? `Überfällig seit ${formatDate(task.dueDate)}`
                        : formatTaskDueDate(task.dueDate, today, tomorrow)}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-400 dark:text-white/45" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
              Termine heute und morgen
            </p>
            <Link href="/calendar" className="text-xs font-medium text-brand-red hover:underline">
              Kalender öffnen
            </Link>
          </div>
          {todayEvents.length === 0 && tomorrowEvents.length === 0 ? (
            <p className="text-sm text-gray-500">
              Heute und morgen stehen keine Termine im Kalender.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              <EventDayList label="Heute" events={todayEvents} emptyText="Keine Termine heute." />
              <EventDayList
                label="Morgen"
                events={tomorrowEvents}
                emptyText="Keine Termine morgen."
              />
            </div>
          )}
        </section>
      </div>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">
            Aktive Lernpläne
          </p>
          {activePlans.length > visibleActivePlans.length && (
            <Link href="/study-plan" className="text-xs font-medium text-brand-red hover:underline">
              Alle anzeigen
            </Link>
          )}
        </div>
        {visibleActivePlans.length === 0 ? (
          <div className="flex flex-col items-start gap-3">
            <p className="text-sm text-gray-500">
              {plans.length === 0
                ? "Noch keine Lernpläne. Erstelle einen Lernplan, um Aufgaben und Lerntermine zu planen."
                : "Keine aktiven Lernpläne. Starte einen neuen Plan oder öffne abgeschlossene Pläne in der Lernplanübersicht."}
            </p>
            <Link
              href="/study-plan?create=1"
              className="inline-flex items-center gap-1.5 rounded-lg bg-brand-red px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              Lernplan erstellen
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {visibleActivePlans.map((p) => {
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
                    <p className="flex items-center gap-1 truncate text-xs text-gray-500">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {p.subject}
                        {p.nextTask ? ` · Nächste Aufgabe: ${p.nextTask.title}` : ""}
                      </span>
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
      </section>
    </div>
  );
}

function EventDayList({
  label,
  events,
  emptyText,
}: {
  label: string;
  events: CalEvent[];
  emptyText: string;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <p className="text-xs font-semibold text-gray-500">{label}</p>
      {events.length === 0 ? (
        <p className="rounded-xl border border-dashed border-gray-200 px-3 py-2 text-xs text-gray-500">
          {emptyText}
        </p>
      ) : (
        events.map((event) => (
          <Link
            key={event.id}
            href="/calendar"
            className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 transition-colors hover:border-gray-300"
          >
            {event.allDay ? (
              <CalendarClock className="h-4 w-4 shrink-0 text-blue-500" />
            ) : (
              <Clock className="h-4 w-4 shrink-0 text-blue-500" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{event.title}</p>
              <p className="truncate text-xs text-gray-500">
                {formatEventTime(event)}
                {event.subject ? ` · ${event.subject}` : ""}
              </p>
            </div>
          </Link>
        ))
      )}
    </div>
  );
}
