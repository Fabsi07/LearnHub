import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/study-plan/types";
import { validateTaskInput } from "@/lib/study-plan/taskValidation";

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
  const validation = validateTaskInput(body, "patch");
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const data: Record<string, unknown> = { ...validation.data };

  if (typeof validation.data.completed === "boolean") {
    // completedAt mitführen, damit der Erledigungszeitpunkt korrekt ist.
    data.completedAt = validation.data.completed ? new Date() : null;
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
