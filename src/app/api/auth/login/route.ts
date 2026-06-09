import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

// Statischer Dummy-Hash für User-Enumeration-Schutz (auth-concept.md §4).
// bcrypt mit Cost 12 – gleiche Arbeit wie bei echten Passwörtern.
const DUMMY_HASH =
  "$2a$12$dummy.hash.for.timing.protection.only.never.matches";

const loginSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse an."),
  password: z.string().min(1, "Bitte gib dein Passwort ein."),
  rememberMe: z.boolean().optional().default(false),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }

  const { email, password, rememberMe } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, passwordHash: true },
  });

  // Immer bcrypt ausführen – auch bei unbekannter E-Mail (Dummy-Hash).
  // Verhindert, dass die Antwortzeit verrät ob eine E-Mail existiert.
  const hashToCheck = user?.passwordHash ?? DUMMY_HASH;
  const valid = await verifyPassword(password, hashToCheck);

  if (!user || !valid) {
    return NextResponse.json(
      { error: "E-Mail oder Passwort ist falsch." },
      { status: 401 },
    );
  }

  await createSession(user.id, rememberMe);

  return NextResponse.json({ ok: true }, { status: 200 });
}
