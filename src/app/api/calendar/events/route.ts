import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { EventType as DbEventType } from "@prisma/client";
import type { EventType as CalEventType, RepeatRule } from "@/components/calendar/events";

const TYPE_TO_DB: Record<CalEventType, DbEventType> = {
  Lernsession: "LERNEINHEIT",
  Klausur: "VORLESUNG",
  Deadline: "ZIELTERMIN",
  Pause: "SONSTIGES",
};

const TYPE_FROM_DB: Record<DbEventType, CalEventType> = {
  LERNEINHEIT: "Lernsession",
  VORLESUNG: "Klausur",
  ZIELTERMIN: "Deadline",
  SONSTIGES: "Pause",
};

const TYPE_COLOR: Record<CalEventType, string> = {
  Lernsession: "bg-blue-500",
  Klausur: "bg-brand-red",
  Deadline: "bg-amber-500",
  Pause: "bg-emerald-500",
};

/** GET /api/calendar/events — alle lokalen Events aus der DB */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const rows = await prisma.calendarEvent.findMany({
    where: { source: "LOCAL", ownerId: session.userId },
    orderBy: { startsAt: "asc" },
  });

  const events = rows.map((e) => {
    const calType = TYPE_FROM_DB[e.type];
    return {
      id: e.id,
      title: e.title,
      start: e.startsAt.toISOString(),
      end: e.endsAt.toISOString(),
      allDay: e.allDay,
      type: calType,
      color: TYPE_COLOR[calType],
      source: "local" as const,
      location: e.location ?? undefined,
      notes: e.notes ?? undefined,
      tasks: e.tasks ?? undefined,
      subject: e.subject ?? undefined,
      repeat: (e.repeat as RepeatRule | null) ?? "none",
    };
  });

  return NextResponse.json({ events });
}

/** POST /api/calendar/events — neues lokales Event speichern */
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

  const { title, start, end, allDay, type, location, notes, tasks, subject, repeat } =
    (body ?? {}) as Record<string, unknown>;

  if (
    typeof title !== "string" ||
    typeof start !== "string" ||
    typeof end !== "string" ||
    typeof type !== "string"
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  // Bekannte Typen werden auf den passenden DB-Enum gemappt;
  // unbekannte Freitext-Typen landen als SONSTIGES.
  const dbType: DbEventType =
    (TYPE_TO_DB as Record<string, DbEventType>)[type] ?? "SONSTIGES";

  const startsAt = new Date(start);
  const endsAt = new Date(end);
  if (
    Number.isNaN(startsAt.getTime()) ||
    Number.isNaN(endsAt.getTime()) ||
    endsAt.getTime() <= startsAt.getTime()
  ) {
    return NextResponse.json({ error: "Ungültiger Zeitraum" }, { status: 400 });
  }

  const repeatRule: RepeatRule =
    repeat === "daily" || repeat === "weekly" || repeat === "none" ? repeat : "none";

  const row = await prisma.calendarEvent.create({
    data: {
      title: title.trim(),
      startsAt,
      endsAt,
      allDay: allDay === true,
      type: dbType,
      location: typeof location === "string" ? location : null,
      notes: typeof notes === "string" ? notes.trim() || null : null,
      tasks: typeof tasks === "string" ? tasks.trim() || null : null,
      subject: typeof subject === "string" ? subject : null,
      repeat: repeatRule,
      source: "LOCAL",
      ownerId: session.userId,
    },
  });

  const calType = TYPE_FROM_DB[row.type];

  return NextResponse.json({
    event: {
      id: row.id,
      title: row.title,
      start: row.startsAt.toISOString(),
      end: row.endsAt.toISOString(),
      allDay: row.allDay,
      type: calType,
      color: TYPE_COLOR[calType],
      source: "local" as const,
      location: row.location ?? undefined,
      notes: row.notes ?? undefined,
      tasks: row.tasks ?? undefined,
      subject: row.subject ?? undefined,
      repeat: (row.repeat as RepeatRule | null) ?? "none",
    },
  });
}
