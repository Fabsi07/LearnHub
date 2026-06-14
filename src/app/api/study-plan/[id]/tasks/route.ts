import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeTask } from "@/lib/study-plan/types";
import { validateTaskInput } from "@/lib/study-plan/taskValidation";

/** POST /api/study-plan/[id]/tasks — neue Aufgabe zu einem Lernplan anlegen. */
export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;

  // Sicherstellen, dass der Lernplan dem User gehört.
  const plan = await prisma.studyPlan.findFirst({
    where: { id, ownerId: session.userId },
    select: { id: true },
  });
  if (!plan) {
    return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }
  const validation = validateTaskInput(body, "create");
  if ("error" in validation) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  const task = await prisma.task.create({
    data: {
      title: validation.data.title!,
      description: validation.data.description ?? null,
      estimatedMinutes: validation.data.estimatedMinutes!,
      difficulty: validation.data.difficulty!,
      dueDate: validation.data.dueDate!,
      studyPlanId: id,
    },
  });

  return NextResponse.json({ task: serializeTask(task) }, { status: 201 });
}
