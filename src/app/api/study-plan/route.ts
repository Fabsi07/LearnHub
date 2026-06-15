import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { calculateStudyPlan } from "@/lib/calculations/studyPlanAlgorithm";
import { calculateTaskProgress } from "@/lib/study-plan/progress";
import {
  isValidGoalType,
  serializeStudyPlan,
  toIntInRange,
  toPositiveInt,
  type StudyPlanSummaryDTO,
} from "@/lib/study-plan/types";

/** GET /api/study-plan — alle Lernpläne des eingeloggten Users (mit Fortschritt). */
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  const plans = await prisma.studyPlan.findMany({
    where: { ownerId: session.userId },
    orderBy: { targetDate: "asc" },
    include: {
      tasks: {
        select: { id: true, title: true, dueDate: true, completed: true },
        orderBy: { dueDate: "asc" },
      },
    },
  });

  const studyPlans: StudyPlanSummaryDTO[] = plans.map((p) => {
    const { completedTaskCount } = calculateTaskProgress(p.tasks);
    const next = p.tasks.find((t) => !t.completed) ?? null;
    return {
      ...serializeStudyPlan(p),
      taskCount: p.tasks.length,
      completedTaskCount,
      nextTask: next
        ? { id: next.id, title: next.title, dueDate: next.dueDate.toISOString() }
        : null,
    };
  });

  return NextResponse.json({ studyPlans });
}

/** POST /api/study-plan — neuen Lernplan anlegen (Algorithmus serverseitig berechnen). */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht angemeldet." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültiger Anfrage-Body." }, { status: 400 });
  }

  const {
    title,
    subject,
    description,
    goalType,
    targetDate,
    difficulty,
    priorKnowledge,
    pages,
    credits,
  } = (body ?? {}) as Record<string, unknown>;

  if (
    typeof title !== "string" ||
    !title.trim() ||
    typeof subject !== "string" ||
    !subject.trim() ||
    !isValidGoalType(goalType) ||
    typeof targetDate !== "string"
  ) {
    return NextResponse.json(
      { error: "Pflichtfelder fehlen oder sind ungültig." },
      { status: 400 },
    );
  }

  const target = new Date(targetDate);
  if (Number.isNaN(target.getTime())) {
    return NextResponse.json({ error: "Ungültiges Zieldatum." }, { status: 400 });
  }

  // Algorithmus-Eingaben (optional). Nur wenn alle vier vorhanden sind, wird gerechnet.
  const diff = toIntInRange(difficulty, 1, 5);
  const know = toIntInRange(priorKnowledge, 1, 5);
  const pgs = toPositiveInt(pages);
  const crd = toIntInRange(credits, 1, 10);

  let totalHours: number | null = null;
  let hoursPerDay: number | null = null;
  let planType: string | null = null;
  if (diff && know && pgs && crd) {
    const r = calculateStudyPlan({
      deadlineDate: target,
      difficulty: diff as 1 | 2 | 3 | 4 | 5,
      priorKnowledge: know as 1 | 2 | 3 | 4 | 5,
      pages: pgs,
      credits: crd,
    });
    totalHours = r.totalHours;
    hoursPerDay = r.hoursPerDay;
    planType = r.planType;
  }

  const plan = await prisma.studyPlan.create({
    data: {
      title: title.trim(),
      subject: subject.trim(),
      description:
        typeof description === "string" && description.trim()
          ? description.trim()
          : null,
      goalType,
      targetDate: target,
      ownerId: session.userId,
      difficulty: diff,
      priorKnowledge: know,
      pages: pgs,
      credits: crd,
      totalHours,
      hoursPerDay,
      planType,
    },
  });

  return NextResponse.json({ studyPlan: serializeStudyPlan(plan) }, { status: 201 });
}
