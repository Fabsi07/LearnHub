import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runNotificationChecks } from "@/lib/notifications/automatic";
import {
  isNotificationType,
  serializeNotification,
  toDbNotificationType,
} from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

const RETENTION_MS = 7 * 24 * 60 * 60 * 1000;

/** GET /api/notifications - aktive Benachrichtigungen des angemeldeten Users. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const now = new Date();
  await runNotificationChecks(session.userId, now);

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
