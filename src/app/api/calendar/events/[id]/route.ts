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
  const { id } = await params;
  const body = await req.json().catch(() => null);
  const { start, end } = body ?? {};

  const row = await prisma.calendarEvent.update({
    where: { id },
    data: {
      ...(start ? { startsAt: new Date(start) } : {}),
      ...(end ? { endsAt: new Date(end) } : {}),
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

/** DELETE /api/calendar/events/[id] — Event löschen */
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = params;

  const deleted = await prisma.calendarEvent.deleteMany({
    where: { id, ownerId: session.userId, source: "LOCAL" },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Event nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
