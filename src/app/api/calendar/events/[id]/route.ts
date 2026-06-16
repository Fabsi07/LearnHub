import { EventType as DbEventType } from "@prisma/client";
import { NextResponse } from "next/server";
import {
  getEventColor,
  isAllowedTimedRange,
  type RepeatRule,
} from "@/components/calendar/events";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

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

/** PATCH /api/calendar/events/[id] - Event aktualisieren */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }

  const {
    start,
    end,
    title,
    allDay,
    type,
    typeColor,
    location,
    notes,
    tasks,
    subject,
    important,
    repeat,
  } = (body ?? {}) as Record<string, unknown>;
  const data: Record<string, unknown> = {};

  if (typeof title === "string") {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      return NextResponse.json({ error: "Titel ist ein Pflichtfeld." }, { status: 400 });
    }
    data.title = trimmedTitle;
  }
  if (typeof allDay === "boolean") data.allDay = allDay;

  if (typeof type === "string") {
    const trimmedType = type.trim();
    if (!trimmedType) {
      return NextResponse.json({ error: "Typ ist ein Pflichtfeld." }, { status: 400 });
    }
    data.type = TYPE_TO_DB[trimmedType] ?? "SONSTIGES";
    data.typeLabel = trimmedType;
  }
  const savedColor =
    typeof typeColor === "string"
      ? getEventColor(typeof type === "string" ? type : undefined, typeColor)
      : undefined;
  if (savedColor) {
    data.typeColor = savedColor;
  }

  if (typeof location === "string") data.location = location;
  if (location === null) data.location = null;
  if (typeof notes === "string") data.notes = notes.trim() || null;
  if (notes === null) data.notes = null;
  if (typeof tasks === "string") data.tasks = tasks.trim() || null;
  if (tasks === null) data.tasks = null;

  if (typeof subject === "string") {
    const trimmedSubject = subject.trim();
    if (!trimmedSubject) {
      return NextResponse.json({ error: "Fach ist ein Pflichtfeld." }, { status: 400 });
    }
    data.subject = trimmedSubject;
  }
  if (typeof important === "boolean") data.important = important;

  if (typeof repeat === "string") {
    data.repeat =
      repeat === "daily" || repeat === "weekly" || repeat === "none" ? repeat : "none";
  }

  let startsAt: Date | undefined;
  let endsAt: Date | undefined;
  if (typeof start === "string") {
    startsAt = new Date(start);
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Ungültiges Start-Datum." }, { status: 400 });
    }
    data.startsAt = startsAt;
  }
  if (typeof end === "string") {
    endsAt = new Date(end);
    if (Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: "Ungültiges End-Datum." }, { status: 400 });
    }
    data.endsAt = endsAt;
  }
  if (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime()) {
    return NextResponse.json({ error: "Ungültiger Zeitraum." }, { status: 400 });
  }
  if (
    startsAt &&
    endsAt &&
    allDay !== true &&
    !isAllowedTimedRange(startsAt, endsAt)
  ) {
    return NextResponse.json(
      { error: "Termine müssen zwischen 07:00 und 00:00 Uhr liegen." },
      { status: 400 },
    );
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  const { count, row } = await prisma.$transaction(async (tx) => {
    const updated = await tx.calendarEvent.updateMany({
      where: { id, ownerId: session.userId, source: "LOCAL" },
      data,
    });

    const fetched =
      updated.count === 0
        ? null
        : await tx.calendarEvent.findFirst({
            where: { id, ownerId: session.userId, source: "LOCAL" },
            include: {
              task: { select: { completed: true } },
              studyPlan: { select: { title: true } },
            },
          });

    // Verschobene/umgeplante Lerneinheit: Fälligkeit (Startzeit) und Dauer der
    // verknüpften Aufgabe mitziehen, damit Kalender und Lernplan-Aufgabe
    // konsistent bleiben.
    if (updated.count > 0 && fetched?.taskId && (startsAt || endsAt)) {
      const taskData: { dueDate?: Date; estimatedMinutes?: number } = {};

      // Fälligkeit nur mitziehen, wenn die Startzeit im Request geändert wurde.
      if (startsAt) taskData.dueDate = fetched.startsAt;

      // Dauer aktualisieren, sobald Start oder Ende geändert wurde.
      const minutes = Math.round(
        (fetched.endsAt.getTime() - fetched.startsAt.getTime()) / 60000,
      );
      taskData.estimatedMinutes = Math.max(1, minutes);

      await tx.task.updateMany({
        where: { id: fetched.taskId, studyPlan: { ownerId: session.userId } },
        data: taskData,
      });
    }

    return { count: updated.count, row: fetched };
  });

  if (count === 0) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }
  if (!row) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }

  const savedType = eventTypeLabel(row.type, row.typeLabel);
  if (savedColor) {
    const legacyDbType = TYPE_TO_DB[savedType];
    await prisma.calendarEvent.updateMany({
      where: {
        ownerId: session.userId,
        source: "LOCAL",
        OR: [
          { typeLabel: savedType },
          ...(legacyDbType ? [{ type: legacyDbType, typeLabel: null }] : []),
        ],
      },
      data: { typeColor: savedColor },
    });
  }
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
      studyPlanTitle: row.studyPlan?.title ?? undefined,
      taskId: row.taskId ?? undefined,
      taskCompleted: row.task ? row.task.completed : undefined,
    },
  });
}

/** DELETE /api/calendar/events/[id] - Event löschen */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.calendarEvent.deleteMany({
    where: { id, ownerId: session.userId, source: "LOCAL" },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
