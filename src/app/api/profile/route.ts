import { NextResponse } from "next/server";
import { z } from "zod";
import { Prisma } from "@prisma/client";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

const profileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "Bitte gib einen Namen an.")
    .max(80, "Der Name darf höchstens 80 Zeichen lang sein."),
  lastName: z
    .string()
    .trim()
    .max(40, "Der Nachname darf höchstens 40 Zeichen lang sein.")
    .optional()
    .default(""),
  username: z
    .string()
    .trim()
    .min(1, "Bitte gib einen Username an.")
    .max(40, "Der Username darf höchstens 40 Zeichen lang sein.")
    .regex(
      /^[A-Za-z0-9._-]+$/,
      "Der Username darf nur Buchstaben, Zahlen, Punkte, Unterstriche und Bindestriche enthalten.",
    ),
});

function serializeUser(user: {
  id: string;
  email: string;
  displayName: string;
  username: string | null;
  avatarUrl: string | null;
}) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    username: user.username,
    avatarUrl: user.avatarUrl,
  };
}

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

  const parsed = profileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungültige Eingabe." },
      { status: 400 },
    );
  }

  const { firstName, lastName, username } = parsed.data;
  const displayName = [firstName, lastName].filter(Boolean).join(" ");

  try {
    const user = await prisma.user.update({
      where: { id: session.userId },
      data: {
        displayName,
        username,
      },
      select: {
        id: true,
        email: true,
        displayName: true,
        username: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ user: serializeUser(user) });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return NextResponse.json(
        { error: "Dieser Username ist bereits vergeben." },
        { status: 409 },
      );
    }

    throw error;
  }
}
