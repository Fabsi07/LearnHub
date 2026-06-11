import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { serializeTask, toIntInRange, toPositiveInt } from "@/lib/study-plan/types";

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
  const b = (body ?? {}) as Record<string, unknown>;

  if (typeof b.title !== "string" || !b.title.trim() || typeof b.dueDate !== "string") {
    return NextResponse.json(
      { error: "Pflichtfelder fehlen oder sind ungültig." },
      { status: 400 },
    );
  }

  const due = new Date(b.dueDate);
  if (Number.isNaN(due.getTime())) {
    return NextResponse.json({ error: "Ungültiges Fälligkeitsdatum." }, { status: 400 });
  }

  const estimatedMinutes = toPositiveInt(b.estimatedMinutes) ?? 60;
  const difficulty = toIntInRange(b.difficulty, 1, 5) ?? 3;

  const task = await prisma.task.create({
    data: {
      title: b.title.trim(),
      description:
        typeof b.description === "string" && b.description.trim()
          ? b.description.trim()
          : null,
      estimatedMinutes,
      difficulty,
      dueDate: due,
      studyPlanId: id,
    },
  });

  return NextResponse.json({ task: serializeTask(task) }, { status: 201 });
}
