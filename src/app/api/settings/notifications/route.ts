import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  getNotificationSettings,
  parseNotificationSettings,
  updateNotificationSettings,
} from "@/lib/notifications/settings";

/** GET /api/settings/notifications - Benachrichtigungseinstellungen laden. */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const settings = await getNotificationSettings(session.userId);
  return NextResponse.json({ settings });
}

/** PUT /api/settings/notifications - Benachrichtigungseinstellungen speichern. */
export async function PUT(request: Request) {
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

  const settings = parseNotificationSettings(body);
  if (!settings) {
    return NextResponse.json({ error: "Ungültige Einstellungen." }, { status: 400 });
  }

  const savedSettings = await updateNotificationSettings(session.userId, settings);
  return NextResponse.json({ settings: savedSettings });
}
