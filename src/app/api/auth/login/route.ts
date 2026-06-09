import { NextResponse } from "next/server";
import { z } from "zod";
import { createSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";
import { prisma } from "@/lib/prisma";

const loginSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse an."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
  rememberMe: z.boolean().optional().default(false),
});

const DUMMY_PASSWORD_HASH =
  "$2b$12$k98oNP5DWCCJWf3t.KKUdu9TKIw0HizpZyD/srcNaZZlOQ17acOZS";

const LOGIN_ERROR = "E-Mail oder Passwort ist falsch.";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
  } catch {
    return NextResponse.json(
      { error: "Ungültiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungueltige Eingabe." },
      { status: 400 },
    );
  }

  const { email, password, rememberMe } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, passwordHash: true },
  });

  if (!user) {
    await verifyPassword(password, DUMMY_PASSWORD_HASH);
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 401 });
  }

  const passwordMatches = await verifyPassword(password, user.passwordHash);
  if (!passwordMatches) {
    return NextResponse.json({ error: LOGIN_ERROR }, { status: 401 });
  }

  await createSession(user.id, rememberMe);

  return NextResponse.json({ ok: true });
}
