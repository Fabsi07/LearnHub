import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { serializeNotification } from "@/lib/notifications/types";
import { prisma } from "@/lib/prisma";

/** PATCH /api/notifications/[id] - Status einer Benachrichtigung speichern. */
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const input = (body ?? {}) as Record<string, unknown>;
  const data: { isDone?: boolean; isArchived?: boolean } = {};
  if (typeof input.isDone === "boolean") data.isDone = input.isDone;
  if (typeof input.isArchived === "boolean") data.isArchived = input.isArchived;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  const { id } = await params;
  const updated = await prisma.notification.updateMany({
    where: {
      id,
      ownerId: session.userId,
      expiresAt: { gt: new Date() },
    },
    data,
  });

  if (updated.count === 0) {
    return NextResponse.json(
      { error: "Benachrichtigung nicht gefunden." },
      { status: 404 },
    );
  }

  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) {
    return NextResponse.json(
      { error: "Benachrichtigung nicht gefunden." },
      { status: 404 },
    );
  }

  return NextResponse.json({
    notification: serializeNotification(notification),
  });
}

/** DELETE /api/notifications/[id] - eine Benachrichtigung sofort löschen. */
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;
  const deleted = await prisma.notification.deleteMany({
    where: { id, ownerId: session.userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json(
      { error: "Benachrichtigung nicht gefunden." },
      { status: 404 },
    );
  }

  return NextResponse.json({ ok: true });
}
