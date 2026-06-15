import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminUsersPayload } from "@/lib/admin/users";
import { getAdminAuth, isFixedAdminEmail } from "@/lib/auth/admin";
import { prisma } from "@/lib/prisma";

const updateUserSchema = z.object({
  displayName: z
    .string()
    .trim()
    .min(1, "Bitte gib einen Namen an.")
    .max(80, "Der Name darf hoechstens 80 Zeichen lang sein."),
  role: z.enum(["USER", "ADMIN"]),
});

function unauthorized(status: "unauthenticated" | "forbidden") {
  return NextResponse.json(
    {
      error:
        status === "unauthenticated" ? "Nicht angemeldet." : "Keine Admin-Berechtigung.",
    },
    { status: status === "unauthenticated" ? 401 : 403 },
  );
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const auth = await getAdminAuth();
  if (auth.status !== "ok") {
    return unauthorized(auth.status);
  }

  const { id } = params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungueltiger Anfrage-Body." },
      { status: 400 },
    );
  }

  const parsed = updateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Ungueltige Eingabe." },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
  }

  const fixedAdmin = isFixedAdminEmail(target.email);
  if ((id === auth.user.id || fixedAdmin) && parsed.data.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Dieser Admin-Account kann nicht zur Nutzerrolle geändert werden." },
      { status: 400 },
    );
  }

  await prisma.user.update({
    where: { id },
    data: {
      displayName: parsed.data.displayName,
      role: parsed.data.role,
    },
  });

  return NextResponse.json(await getAdminUsersPayload());
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getAdminAuth();
  if (auth.status !== "ok") {
    return forbidden();
  }

  const { id } = await params;

  if (id === auth.user.id) {
    return NextResponse.json(
      { error: "Der aktuell angemeldete Admin kann nicht gelöscht werden." },
      { status: 400 },
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { email: true },
  });
  if (!target) {
    return NextResponse.json({ error: "Nutzer nicht gefunden." }, { status: 404 });
  }
  if (isFixedAdminEmail(target.email)) {
    return NextResponse.json(
      { error: "Der feste Admin-Account kann nicht gelöscht werden." },
      { status: 400 },
    );
  }

  await prisma.user.delete({ where: { id } });

  return NextResponse.json(await getAdminUsersPayload());
}
