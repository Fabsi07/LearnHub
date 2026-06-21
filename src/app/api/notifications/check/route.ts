import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runNotificationChecks } from "@/lib/notifications/automatic";
import { prisma } from "@/lib/prisma";

async function handleCheck() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const now = new Date();
  // Abgelaufene Einträge zuerst entfernen, damit ein abgelaufener Eintrag mit
  // gleichem triggerKey die Neuerstellung (createMany skipDuplicates) nicht blockiert.
  await prisma.notification.deleteMany({
    where: { ownerId: session.userId, expiresAt: { lte: now } },
  });

  const result = await runNotificationChecks(session.userId, now);
  return NextResponse.json(result);
}

/** GET /api/notifications/check - alle automatischen Benachrichtigungen prüfen. */
export async function GET() {
  return handleCheck();
}

/** POST /api/notifications/check - alle automatischen Benachrichtigungen prüfen. */
export async function POST() {
  return handleCheck();
}
