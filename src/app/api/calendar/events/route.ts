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

/** GET /api/calendar/events - alle lokalen Events aus der DB */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rows = await prisma.calendarEvent.findMany({
    where: { source: "LOCAL", ownerId: session.userId },
    orderBy: { startsAt: "asc" },
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
    };
  });

  return NextResponse.json({ events });
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
    },
  });
}
