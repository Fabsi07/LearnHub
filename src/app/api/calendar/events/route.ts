import { EventType as DbEventType, GoalType } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  getEventColor,
  isAllowedTimedRange,
  type RepeatRule,
} from "@/components/calendar/events";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

// Beschriftung des Zieltermins je Lernplan-Zieltyp (z. B. "Klausur: Mathe 2").
const GOAL_LABEL: Record<GoalType, string> = {
  KLAUSUR: "Klausur",
  ABGABE: "Abgabe",
  PRAESENTATION: "Präsentation",
  SELBSTLERNZIEL: "Lernziel",
  SONSTIGES: "Zieltermin",
};

const TYPE_TO_DB: Record<string, DbEventType> = {
  Lernsession: "LERNEINHEIT",
  Klausur: "VORLESUNG",
  Deadline: "ZIELTERMIN",
  Pause: "SONSTIGES",
};

const TYPE_FROM_DB: Record<DbEventType, string> = {
  LERNEINHEIT: "Lernsession",
  VORLESUNG: "Klausur",
  ZIELTERMIN: "Deadline",
  SONSTIGES: "Pause",
};

function eventTypeLabel(type: DbEventType, typeLabel: string | null): string {
  return typeLabel?.trim() || TYPE_FROM_DB[type];
}

/** GET /api/calendar/events - alle lokalen Events aus der DB */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rows = await prisma.calendarEvent.findMany({
    where: { source: "LOCAL", ownerId: session.userId },
    orderBy: { startsAt: "asc" },
    include: {
      task: { select: { completed: true } },
      studyPlan: { select: { title: true } },
    },
  });

  const events = rows.map((event) => {
    const type = eventTypeLabel(event.type, event.typeLabel);
    return {
      id: event.id,
      title: event.title,
      start: event.startsAt.toISOString(),
      end: event.endsAt.toISOString(),
      allDay: event.allDay,
      type,
      color: getEventColor(type, event.typeColor ?? undefined),
      source: "local" as const,
      location: event.location ?? undefined,
      notes: event.notes ?? undefined,
      tasks: event.tasks ?? undefined,
      subject: event.subject ?? undefined,
      important: event.important,
      repeat: (event.repeat as RepeatRule | null) ?? "none",
      studyPlanId: event.studyPlanId ?? undefined,
      studyPlanTitle: event.studyPlan?.title ?? undefined,
      taskId: event.taskId ?? undefined,
      taskCompleted: event.task ? event.task.completed : undefined,
    };
  });

  // Zieldaten der Lernplaene als abgeleitete, read-only Zieltermine ergaenzen.
  // Quelle bleibt StudyPlan.targetDate (kein doppeltes Speichern) – aendert sich
  // das Zieldatum, zieht der Kalender automatisch mit. Nicht editierbar, da
  // abgeleitet (siehe CLAUDE.md: read-only Events duerfen nicht editierbar sein).
  const plans = await prisma.studyPlan.findMany({
    where: { ownerId: session.userId },
    select: { id: true, title: true, subject: true, goalType: true, targetDate: true },
  });

  const deadlineEvents = plans.map((plan) => {
    // Ganztaegiger Zieltermin: Ende exklusiv auf den Folgetag, damit
    // eventOverlapsDay() (verlangt end > dayStart) den Termin am Zieltag in
    // Monats-, Wochen- und Tagesansicht anzeigt.
    const dayStart = new Date(plan.targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart);
    dayEnd.setDate(dayEnd.getDate() + 1);
    return {
      id: `plan-deadline-${plan.id}`,
      title: `${GOAL_LABEL[plan.goalType]}: ${plan.subject}`,
      start: dayStart.toISOString(),
      end: dayEnd.toISOString(),
      allDay: true,
      type: "Deadline",
      color: getEventColor("Deadline", "bg-brand-red"),
      source: "local" as const,
      // Fach mitgeben, damit der Fachfilter greift und das Fach in der
      // Detailansicht erscheint.
      subject: plan.subject,
      important: true,
      readOnly: true,
      repeat: "none" as const,
      studyPlanId: plan.id,
      studyPlanTitle: plan.title,
    };
  });

  return NextResponse.json({ events: [...events, ...deadlineEvents] });
}

/** POST /api/calendar/events - neues lokales Event speichern */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }

  const {
    title,
    start,
    end,
    allDay,
    type,
    typeColor,
    location,
    notes,
    tasks,
    subject,
    important,
    repeat,
    studyPlanId,
    taskId,
  } = (body ?? {}) as Record<string, unknown>;
  const trimmedTitle = typeof title === "string" ? title.trim() : "";
  const trimmedType = typeof type === "string" ? type.trim() : "";
  const trimmedSubject = typeof subject === "string" ? subject.trim() : "";
  const savedColor = getEventColor(
    trimmedType,
    typeof typeColor === "string" ? typeColor : undefined,
  );

  if (
    !trimmedTitle ||
    typeof start !== "string" ||
    typeof end !== "string" ||
    !trimmedType ||
    !trimmedSubject
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }

  const startsAt = new Date(start);
  const endsAt = new Date(end);
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    endsAt.getTime() <= startsAt.getTime()
  ) {
    return NextResponse.json({ error: "Ungültiger Zeitraum." }, { status: 400 });
  }
  if (allDay !== true && !isAllowedTimedRange(startsAt, endsAt)) {
    return NextResponse.json(
      { error: "Termine müssen zwischen 07:00 und 00:00 Uhr liegen." },
      { status: 400 },
    );
  }

  const repeatRule: RepeatRule =
    repeat === "daily" || repeat === "weekly" || repeat === "none" ? repeat : "none";

  // Optionale Lernplan-Verknüpfung: nur akzeptieren, wenn der Plan dem User gehört.
  let planId: string | null = null;
  let planTitle: string | null = null;
  if (typeof studyPlanId === "string" && studyPlanId) {
    const plan = await prisma.studyPlan.findFirst({
      where: { id: studyPlanId, ownerId: session.userId },
      select: { id: true, title: true },
    });
    if (!plan) {
      return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
    }
    planId = plan.id;
    planTitle = plan.title;
  }

  // Optionale Task-Verknüpfung (1:1): Aufgabe muss dem User gehören und darf
  // noch nicht mit einem anderen Termin verknüpft sein.
  let linkedTask: { id: string; completed: boolean } | null = null;
  if (typeof taskId === "string" && taskId) {
    const task = await prisma.task.findFirst({
      where: { id: taskId, studyPlan: { ownerId: session.userId } },
      select: {
        id: true,
        completed: true,
        studyPlan: { select: { id: true, title: true } },
        calendarEvent: { select: { id: true } },
      },
    });
    if (!task) {
      return NextResponse.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
    }
    if (task.calendarEvent) {
      return NextResponse.json(
        { error: "Aufgabe ist bereits mit einem Termin verknüpft." },
        { status: 409 },
      );
    }
    if (planId && task.studyPlan.id !== planId) {
      return NextResponse.json(
        { error: "Aufgabe gehört nicht zu diesem Lernplan." },
        { status: 400 },
      );
    }
    planId = planId ?? task.studyPlan.id;
    planTitle = planTitle ?? task.studyPlan.title;
    linkedTask = { id: task.id, completed: task.completed };
  }

  const row = await prisma.calendarEvent.create({
    data: {
      title: trimmedTitle,
      startsAt,
      endsAt,
      allDay: allDay === true,
      type: TYPE_TO_DB[trimmedType] ?? "SONSTIGES",
      typeLabel: trimmedType,
      typeColor: savedColor,
      location: typeof location === "string" ? location : null,
      notes: typeof notes === "string" ? notes.trim() || null : null,
      tasks: typeof tasks === "string" ? tasks.trim() || null : null,
      subject: trimmedSubject,
      important: important === true,
      repeat: repeatRule,
      source: "LOCAL",
      ownerId: session.userId,
      studyPlanId: planId,
      taskId: linkedTask?.id ?? null,
    },
  });

  const savedType = eventTypeLabel(row.type, row.typeLabel);
  return NextResponse.json({
    event: {
      id: row.id,
      title: row.title,
      start: row.startsAt.toISOString(),
      end: row.endsAt.toISOString(),
      allDay: row.allDay,
      type: savedType,
      color: getEventColor(savedType, row.typeColor ?? undefined),
      source: "local" as const,
      location: row.location ?? undefined,
      notes: row.notes ?? undefined,
      tasks: row.tasks ?? undefined,
      subject: row.subject ?? undefined,
      important: row.important,
      repeat: (row.repeat as RepeatRule | null) ?? "none",
      studyPlanId: row.studyPlanId ?? undefined,
      studyPlanTitle: planTitle ?? undefined,
      taskId: row.taskId ?? undefined,
      taskCompleted: linkedTask ? linkedTask.completed : undefined,
    },
  });
}
