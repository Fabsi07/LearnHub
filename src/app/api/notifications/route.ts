import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  isNotificationType,
  serializeNotification,
  toDbNotificationType,
} from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

const MISSED_SESSION_SUBJECT = "Lernsession nicht abgehakt";

/**
 * Erzeugt Benachrichtigungen für vergangene, nicht abgehakte Lernsessions
 * (Kalender-Lerneinheiten mit verknüpfter, offener Lernplan-Aufgabe).
 * Idempotent: pro Session entsteht höchstens eine Benachrichtigung
 * (Dedupe über Fach + Endzeitpunkt).
 */
async function createMissedSessionNotifications(userId: string, now: Date) {
  const since = new Date(now.getTime() - RETENTION_MS);
  const missed = await prisma.calendarEvent.findMany({
    where: {
      ownerId: userId,
      source: "LOCAL",
      type: "LERNEINHEIT",
      taskId: { not: null },
      endsAt: { lt: now, gt: since },
      task: { is: { completed: false } },
    },
    select: { title: true, subject: true, endsAt: true },
  });
  if (missed.length === 0) return;

  const existing = await prisma.notification.findMany({
    where: { ownerId: userId, subject: MISSED_SESSION_SUBJECT, expiresAt: { gt: now } },
    select: { course: true, dueDate: true },
  });
  const seen = new Set(existing.map((n) => `${n.course}|${n.dueDate.getTime()}`));

  const pad = (n: number) => n.toString().padStart(2, "0");
  const toCreate = missed
    .filter((e) => !seen.has(`${e.subject ?? e.title}|${e.endsAt.getTime()}`))
    .map((e) => {
      const d = e.endsAt;
      const when = `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} um ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`;
      return {
        type: "ASSIGNMENT" as const,
        subject: MISSED_SESSION_SUBJECT,
        course: e.subject ?? e.title,
        dueDate: e.endsAt,
        description:
          `Deine Lernsession „${e.title}“ (geplant bis ${when}) wurde noch nicht abgehakt. ` +
          "Hake sie im Kalender ab oder verschiebe sie – der Lernplan ist eine Basis, kein Pflichtprogramm.",
        ownerId: userId,
        expiresAt: new Date(e.endsAt.getTime() + RETENTION_MS),
      };
    });
  if (toCreate.length > 0) {
    await prisma.notification.createMany({ data: toCreate });
  }
}

/** GET /api/notifications - aktive Benachrichtigungen des angemeldeten Users. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const now = new Date();
  // Erst fehlende Hinweise zu nicht abgehakten Lernsessions erzeugen,
  // damit sie direkt in der Antwort enthalten sind.
  await createMissedSessionNotifications(session.userId, now);
  const [, notifications] = await prisma.$transaction([
    prisma.notification.deleteMany({
      where: { ownerId: session.userId, expiresAt: { lte: now } },
    }),
    prisma.notification.findMany({
      where: {
        ownerId: session.userId,
        expiresAt: { gt: now },
      },
      orderBy: [{ isArchived: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
    }),
  ]);

  return NextResponse.json({
    notifications: notifications.map(serializeNotification),
  });
}

/** POST /api/notifications - eine Benachrichtigung sieben Tage lang speichern. */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }

  const data = (body ?? {}) as Record<string, unknown>;
  const subject = typeof data.subject === "string" ? data.subject.trim() : "";
  const course = typeof data.course === "string" ? data.course.trim() : "";
  const description =
    typeof data.description === "string" ? data.description.trim() : "";

  if (
    !isNotificationType(data.type) ||
    !subject ||
    !course ||
    !description ||
    typeof data.dueDate !== "string"
  ) {
    return NextResponse.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }

  const dueDate = new Date(data.dueDate);
  if (Number.isNaN(dueDate.getTime())) {
    return NextResponse.json({ error: "Ungültiges Fälligkeitsdatum." }, { status: 400 });
  }

  const createdAt = new Date();
  const notification = await prisma.notification.create({
    data: {
      type: toDbNotificationType(data.type),
      subject,
      course,
      dueDate,
      description,
      isUrgent: data.isUrgent === true,
      ownerId: session.userId,
      createdAt,
      expiresAt: new Date(createdAt.getTime() + RETENTION_MS),
    },
  });

  return NextResponse.json(
    { notification: serializeNotification(notification) },
    { status: 201 },
  );
}
