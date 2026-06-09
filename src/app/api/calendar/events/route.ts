import { NextResponse } from "next/server";
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
  const rows = await prisma.calendarEvent.findMany({
    where: { source: "LOCAL" },
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
      subject: e.subject ?? undefined,
      repeat: (e.repeat as RepeatRule | null) ?? "none",
    };
  });

  return NextResponse.json({ events });
}

/** POST /api/calendar/events — neues lokales Event speichern */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const { title, start, end, allDay, type, location, notes, subject, repeat } =
    body ?? {};

  if (!title || !start || !end || !type) {
    return NextResponse.json({ error: "Pflichtfelder fehlen" }, { status: 400 });
  }

  const dbType = TYPE_TO_DB[type as CalEventType] ?? "SONSTIGES";

  const row = await prisma.calendarEvent.create({
    data: {
      title: String(title),
      startsAt: new Date(start),
      endsAt: new Date(end),
      allDay: allDay ?? false,
      type: dbType,
      location: location ?? null,
      notes: notes ?? null,
      subject: subject ?? null,
      repeat: repeat ?? "none",
      source: "LOCAL",
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
      subject: row.subject ?? undefined,
      repeat: (row.repeat as RepeatRule | null) ?? "none",
    },
  });
}
