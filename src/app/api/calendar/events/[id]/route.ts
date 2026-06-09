import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { EventType as DbEventType } from "@prisma/client";
import type { EventType as CalEventType, RepeatRule } from "@/components/calendar/events";

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

/** PATCH /api/calendar/events/[id] — Start/End eines Events aktualisieren (Drag) */
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

  const { start, end, title, allDay, type, location, notes, subject, repeat } =
    (body ?? {}) as Record<string, unknown>;

  const TYPE_TO_DB: Record<CalEventType, DbEventType> = {
    Lernsession: "LERNEINHEIT",
    Klausur: "VORLESUNG",
    Deadline: "ZIELTERMIN",
    Pause: "SONSTIGES",
  };

  const data: Record<string, unknown> = {};

  if (typeof title === "string") data.title = title.trim();
  if (typeof allDay === "boolean") data.allDay = allDay;

  if (typeof type === "string") {
    if (!Object.prototype.hasOwnProperty.call(TYPE_TO_DB, type)) {
      return NextResponse.json({ error: "Ungültiger Event-Typ" }, { status: 400 });
    }
    data.type = TYPE_TO_DB[type as CalEventType];
  }

  if (typeof location === "string") data.location = location;
  if (location === null) data.location = null;

  if (typeof notes === "string") data.notes = notes.trim() || null;
  if (notes === null) data.notes = null;

  if (typeof subject === "string") data.subject = subject;
  if (subject === null) data.subject = null;

  if (typeof repeat === "string") {
    data.repeat =
      repeat === "daily" || repeat === "weekly" || repeat === "none" ? repeat : "none";
  }

  let startsAt: Date | undefined;
  let endsAt: Date | undefined;
  if (typeof start === "string") {
    startsAt = new Date(start);
    if (Number.isNaN(startsAt.getTime())) {
      return NextResponse.json({ error: "Ungültiges Start-Datum" }, { status: 400 });
    }
    data.startsAt = startsAt;
  }
  if (typeof end === "string") {
    endsAt = new Date(end);
    if (Number.isNaN(endsAt.getTime())) {
      return NextResponse.json({ error: "Ungültiges End-Datum" }, { status: 400 });
    }
    data.endsAt = endsAt;
  }
  if (startsAt && endsAt && endsAt.getTime() <= startsAt.getTime()) {
    return NextResponse.json({ error: "Ungültiger Zeitraum" }, { status: 400 });
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  const updated = await prisma.calendarEvent.updateMany({
    where: { id, ownerId: session.userId, source: "LOCAL" },
    data,
  });
  if (updated.count === 0) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }

  const row = await prisma.calendarEvent.findUnique({ where: { id } });
  if (!row) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }

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

/** DELETE /api/calendar/events/[id] — Event löschen */
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
