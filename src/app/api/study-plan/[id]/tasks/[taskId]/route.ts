import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeTask, toIntInRange, toPositiveInt } from "@/lib/study-plan/types";

/** Prüft, dass Lernplan + Aufgabe existieren und dem User gehören. */
async function ownsTask(userId: string, planId: string, taskId: string) {
  const task = await prisma.task.findFirst({
    where: { id: taskId, studyPlanId: planId, studyPlan: { ownerId: userId } },
  });
  return task;
}

/** PATCH /api/study-plan/[id]/tasks/[taskId] — Aufgabe bearbeiten / abhaken. */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id, taskId } = await params;
  const existing = await ownsTask(session.userId, id, taskId);
  if (!existing) {
    return NextResponse.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }
  const b = (body ?? {}) as Record<string, unknown>;

  const data: Record<string, unknown> = {};

  if (typeof b.title === "string" && b.title.trim()) data.title = b.title.trim();

  if (b.description === null) data.description = null;
  else if (typeof b.description === "string") data.description = b.description.trim() || null;

  if ("estimatedMinutes" in b) {
    const m = toPositiveInt(b.estimatedMinutes);
    if (m) data.estimatedMinutes = m;
  }

  if ("difficulty" in b) {
    const d = toIntInRange(b.difficulty, 1, 5);
    if (d) data.difficulty = d;
  }

  if (typeof b.dueDate === "string") {
    const due = new Date(b.dueDate);
    if (Number.isNaN(due.getTime())) {
      return NextResponse.json({ error: "Ungültiges Fälligkeitsdatum." }, { status: 400 });
    }
    data.dueDate = due;
  }

  if (typeof b.completed === "boolean") {
    data.completed = b.completed;
    // completedAt mitführen, damit der Erledigungszeitpunkt korrekt ist.
    data.completedAt = b.completed ? new Date() : null;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Keine Änderungen übergeben." }, { status: 400 });
  }

  const updated = await prisma.task.update({ where: { id: taskId }, data });

  return NextResponse.json({ task: serializeTask(updated) });
}

/** DELETE /api/study-plan/[id]/tasks/[taskId] — Aufgabe löschen. */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; taskId: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id, taskId } = await params;
  const existing = await ownsTask(session.userId, id, taskId);
  if (!existing) {
    return NextResponse.json({ error: "Aufgabe nicht gefunden." }, { status: 404 });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return NextResponse.json({ ok: true });
}
