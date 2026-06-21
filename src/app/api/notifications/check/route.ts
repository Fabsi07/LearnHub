import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { runNotificationChecks } from "@/lib/notifications/automatic";

async function handleCheck() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const result = await runNotificationChecks(session.userId);
  return NextResponse.json(result);
}

/** GET /api/notifications/check - verpasste Lernsessions prüfen. */
export async function GET() {
  return handleCheck();
}

/** POST /api/notifications/check - verpasste Lernsessions prüfen. */
export async function POST() {
  return handleCheck();
}
