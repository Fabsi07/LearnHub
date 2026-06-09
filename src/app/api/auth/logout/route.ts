import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { SESSION_COOKIE, sessionCookieOptions } from "@/lib/auth/cookie";

export async function POST() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;

  if (token) {
    // Session aus DB löschen – try/catch falls bereits abgelaufen oder nicht vorhanden.
    try {
      await prisma.session.delete({ where: { id: token } });
    } catch {
      // Ignorieren – Session war bereits ungültig
    }
  }

  // Cookie entwerten: Max-Age=0 lässt den Browser das Cookie sofort löschen.
  cookieStore.set(SESSION_COOKIE, "", sessionCookieOptions(0));

  return NextResponse.json({ ok: true }, { status: 200 });
}
