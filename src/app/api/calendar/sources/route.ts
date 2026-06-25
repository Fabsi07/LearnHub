import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";

const DHBW_ICS_BASE = "https://stash.dhbw-loerrach.de/calendar";
const DHBW_ICS_TIMEOUT_MS = 8000;
const INVALID_COURSE_MESSAGE =
  "Der Link ist nicht verfügbar. Bitte überprüfe dein Kurskürzel.";

function buildDhbwUrl(courseCode: string): string {
  const normalized = courseCode.trim().toLowerCase();
  return `${DHBW_ICS_BASE}/kal-${normalized}@dhbw-loerrach.de.ics`;
}

async function validateDhbwUrl(url: string): Promise<boolean> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), DHBW_ICS_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      headers: {
        Accept: "text/calendar",
        "User-Agent": "Mozilla/5.0 LearnHub-Calendar-Setup",
      },
      signal: ctrl.signal,
      cache: "no-store",
    });

    if (!response.ok) return false;

    const body = await response.text();
    return body.includes("BEGIN:VCALENDAR");
  } catch {
    return false;
  } finally {
    clearTimeout(timer);
  }
}

/** GET /api/calendar/sources — gibt die gespeicherte Kurskennung zurück */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const source = await prisma.calendarSource.findFirst({
    where: { userId: session.userId, type: "ics-dhbw" },
    select: { name: true, url: true },
  });

  return NextResponse.json({ source: source ?? null });
}

/** POST /api/calendar/sources — speichert/aktualisiert die DHBW-Kurskennung */
export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const courseCode = String(body?.courseCode ?? "").trim();

  if (!courseCode) {
    return NextResponse.json({ error: "Kurskennung darf nicht leer sein" }, { status: 400 });
  }
  if (!/^[A-Za-z0-9]+$/.test(courseCode)) {
    return NextResponse.json(
      { error: "Kurskennung enthält ungültige Zeichen" },
      { status: 400 },
    );
  }

  const url = buildDhbwUrl(courseCode);

  const isValidSource = await validateDhbwUrl(url);
  if (isValidSource === null) {
    return NextResponse.json(
      { error: "Netzwerkfehler. Bitte erneut versuchen." },
      { status: 502 },
    );
  }
  if (!isValidSource) {
    return NextResponse.json({ error: INVALID_COURSE_MESSAGE }, { status: 400 });
  }

  // Upsert: ein User hat genau eine DHBW-Quelle
  const existing = await prisma.calendarSource.findFirst({
    where: { userId: session.userId, type: "ics-dhbw" },
  });

  const source = existing
    ? await prisma.calendarSource.update({
        where: { id: existing.id },
        data: {
          name: `DHBW Stundenplan (${courseCode.trim().toUpperCase()})`,
          url,
          lastSyncedAt: null,
        },
      })
    : await prisma.calendarSource.create({
        data: {
          userId: session.userId,
          name: `DHBW Stundenplan (${courseCode.trim().toUpperCase()})`,
          url,
          type: "ics-dhbw",
        },
      });

  return NextResponse.json({ source });
}

/** DELETE /api/calendar/sources — entfernt die gespeicherte DHBW-Kurskennung */
export async function DELETE() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet" }, { status: 401 });
  }

  await prisma.calendarSource.deleteMany({
    where: { userId: session.userId, type: "ics-dhbw" },
  });

  return NextResponse.json({ ok: true });
}
