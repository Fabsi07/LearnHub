import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";

const registerSchema = z.object({
  email: z.string().trim().email("Bitte gib eine gültige E-Mail-Adresse an."),
  displayName: z
    .string()
    .trim()
    .min(1, "Bitte gib einen Anzeigenamen an.")
    .max(80, "Der Anzeigename darf höchstens 80 Zeichen lang sein."),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
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

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }

  const { email, displayName, password, rememberMe } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist bereits registriert." },
      { status: 409 },
    );
  }

  const passwordHash = await hashPassword(password);

  try {
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        displayName,
        passwordHash,
      },
    });

    await createSession(user.id, rememberMe);

    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (err) {
    const code = (err as { code?: string } | null)?.code;
    if (code === "P2002") {
      return NextResponse.json(
        { error: "Diese E-Mail-Adresse ist bereits registriert." },
        { status: 409 },
      );
    }
    throw err;
  }
}
