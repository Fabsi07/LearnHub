import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAuth, isFixedAdminEmail } from "@/lib/auth/admin";
import { hashPassword } from "@/lib/auth/password";
import { getAdminUsersPayload } from "@/lib/admin/users";
import { prisma } from "@/lib/prisma";

const createUserSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Bitte gib einen Namen an.")
    .max(80, "Der Name darf hoechstens 80 Zeichen lang sein."),
  email: z.string().trim().email("Bitte gib eine gueltige E-Mail-Adresse an."),
  password: z
    .string()
    .min(8, "Das Passwort muss mindestens 8 Zeichen lang sein."),
  role: z.enum(["USER", "ADMIN"]).default("USER"),
});

function forbidden() {
  return NextResponse.json({ error: "Keine Admin-Berechtigung." }, { status: 403 });
}

export async function GET() {
  const auth = await getAdminAuth();
  if (auth.status !== "ok") {
    return forbidden();
  }

  return NextResponse.json(await getAdminUsersPayload());
}

export async function POST(request: Request) {
  const auth = await getAdminAuth();
  if (auth.status !== "ok") {
    return forbidden();
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungueltiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = createUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungueltige Eingabe." },
      { status: 400 },
    );
  }

  const { displayName, password, role } = parsed.data;
  const email = parsed.data.email.toLowerCase();

  if (isFixedAdminEmail(email)) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist fuer den festen Admin reserviert." },
      { status: 409 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Diese E-Mail-Adresse ist bereits registriert." },
      { status: 409 },
    );
  }

  await prisma.user.create({
    data: {
      displayName,
      email,
      passwordHash: await hashPassword(password),
      role,
    },
  });

  return NextResponse.json(await getAdminUsersPayload(), { status: 201 });
}
