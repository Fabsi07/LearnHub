import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import {
  AlgorithmInputError,
  calculateStudyPlan,
} from "@/lib/calculations/studyPlanAlgorithm";
import {
  isValidGoalType,
  serializeStudyPlan,
  serializeTask,
  toIntInRange,
  toPositiveInt,
  type StudyPlanDetailDTO,
} from "@/lib/study-plan/types";

/** GET /api/study-plan/[id] — ein Lernplan inkl. Aufgaben. */
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;

  const plan = await prisma.studyPlan.findFirst({
    where: { id, ownerId: session.userId },
    include: { tasks: { orderBy: { dueDate: "asc" } } },
  });

  if (!plan) {
    return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
  }

  const dto: StudyPlanDetailDTO = {
    ...serializeStudyPlan(plan),
    tasks: plan.tasks.map(serializeTask),
  };

  return NextResponse.json({ studyPlan: dto });
}

/** PATCH /api/study-plan/[id] — Lernplan bearbeiten (Ergebnis bei Bedarf neu berechnen). */
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;

  const existing = await prisma.studyPlan.findFirst({
    where: { id, ownerId: session.userId },
  });
  if (!existing) {
    return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
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
  if (typeof b.subject === "string" && b.subject.trim()) data.subject = b.subject.trim();

  if (b.description === null) data.description = null;
  else if (typeof b.description === "string") data.description = b.description.trim() || null;

  if (isValidGoalType(b.goalType)) data.goalType = b.goalType;

  let target = existing.targetDate;
  if (typeof b.targetDate === "string") {
    const t = new Date(b.targetDate);
    if (Number.isNaN(t.getTime())) {
      return NextResponse.json({ error: "Ungültiges Zieldatum." }, { status: 400 });
    }
    data.targetDate = t;
    target = t;
  }

  // Algorithmus-Eingaben mergen: aus Body wenn vorhanden, sonst Bestand.
  const diff = "difficulty" in b ? toIntInRange(b.difficulty, 1, 5) : existing.difficulty;
  const know = "priorKnowledge" in b ? toIntInRange(b.priorKnowledge, 1, 5) : existing.priorKnowledge;
  const pgs = "pages" in b ? toPositiveInt(b.pages) : existing.pages;
  const crd = "credits" in b ? toIntInRange(b.credits, 1, 10) : existing.credits;

  data.difficulty = diff;
  data.priorKnowledge = know;
  data.pages = pgs;
  data.credits = crd;

  // Ergebnis neu berechnen, wenn alle Eingaben vorhanden sind – sonst zurücksetzen.
  if (diff && know && pgs && crd) {
    let r: ReturnType<typeof calculateStudyPlan>;
    try {
      r = calculateStudyPlan({
        referenceDate: new Date(),
        deadlineDate: target,
        difficulty: diff as 1 | 2 | 3 | 4 | 5,
        priorKnowledge: know as 1 | 2 | 3 | 4 | 5,
        pages: pgs,
        credits: crd,
      });
    } catch (error) {
      if (error instanceof AlgorithmInputError) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
      throw error;
    }
    data.totalHours = r.totalHours;
    data.hoursPerDay = r.hoursPerDay;
    data.planType = r.planType;
  } else {
    data.totalHours = null;
    data.hoursPerDay = null;
    data.planType = null;
  }

  const updated = await prisma.studyPlan.update({ where: { id }, data });

  return NextResponse.json({ studyPlan: serializeStudyPlan(updated) });
}

/** DELETE /api/study-plan/[id] — Lernplan löschen (Aufgaben via Cascade). */
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const { id } = await params;

  const deleted = await prisma.studyPlan.deleteMany({
    where: { id, ownerId: session.userId },
  });

  if (deleted.count === 0) {
    return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
