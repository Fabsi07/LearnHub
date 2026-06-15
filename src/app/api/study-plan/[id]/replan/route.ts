import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import {
  ReplanTasksInputError,
  replanOpenTasks,
} from "@/lib/calculations/replanTasks";
import { prisma } from "@/lib/prisma";

export async function POST(
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
    include: {
      tasks: {
        include: {
          calendarEvent: {
            select: { id: true, startsAt: true, endsAt: true },
          },
        },
        orderBy: [{ dueDate: "asc" }, { id: "asc" }],
      },
    },
  });

  if (!plan) {
    return NextResponse.json({ error: "Lernplan nicht gefunden." }, { status: 404 });
  }

  let replanned: ReturnType<typeof replanOpenTasks>;
  try {
    replanned = replanOpenTasks({
      referenceDate: new Date(),
      deadlineDate: plan.targetDate,
      tasks: plan.tasks.map((task) => ({
        id: task.id,
        dueDate: task.dueDate,
        estimatedMinutes: task.estimatedMinutes,
        difficulty: task.difficulty as 1 | 2 | 3 | 4 | 5,
        completed: task.completed,
      })),
    });
  } catch (error) {
    if (error instanceof ReplanTasksInputError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    throw error;
  }

  const changedTasks = replanned.tasks.filter((task) => task.changed);
  const tasksById = new Map(plan.tasks.map((task) => [task.id, task]));

  await prisma.$transaction(async (transaction) => {
    for (const replannedTask of changedTasks) {
      const existingTask = tasksById.get(replannedTask.id);
      if (!existingTask || existingTask.completed) continue;

      await transaction.task.update({
        where: { id: existingTask.id },
        data: { dueDate: replannedTask.dueDate },
      });

      if (existingTask.calendarEvent) {
        const duration =
          existingTask.calendarEvent.endsAt.getTime() -
          existingTask.calendarEvent.startsAt.getTime();
        const startsAt = new Date(replannedTask.dueDate);
        startsAt.setHours(
          existingTask.calendarEvent.startsAt.getHours(),
          existingTask.calendarEvent.startsAt.getMinutes(),
          existingTask.calendarEvent.startsAt.getSeconds(),
          existingTask.calendarEvent.startsAt.getMilliseconds(),
        );

        await transaction.calendarEvent.update({
          where: { id: existingTask.calendarEvent.id },
          data: {
            startsAt,
            endsAt: new Date(startsAt.getTime() + duration),
          },
        });
      }
    }
  });

  return NextResponse.json({
    updatedTaskCount: changedTasks.length,
    warnings: replanned.warnings,
  });
}
