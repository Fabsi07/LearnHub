import assert from "node:assert/strict";
import test from "node:test";

import {
  AlgorithmInputError,
  calculateStudyPlan,
} from "../../src/lib/calculations/studyPlanAlgorithm.ts";
import { replanOpenTasks } from "../../src/lib/calculations/replanTasks.ts";
import { scheduleStudyPlan } from "../../src/lib/study-plan/scheduler.ts";

function localDate(year, month, day, hour = 0) {
  return new Date(year, month - 1, day, hour, 0, 0, 0);
}

test("erstellt einen normalen deterministischen Plan über mehrere Wochen", () => {
  const referenceDate = localDate(2026, 6, 1, 8);
  const deadlineDate = localDate(2026, 7, 13);
  const input = {
    referenceDate,
    deadlineDate,
    difficulty: 3,
    priorKnowledge: 3,
    pages: 100,
    credits: 6,
  };

  const firstCalculation = calculateStudyPlan(input);
  const secondCalculation = calculateStudyPlan(input);
  assert.deepEqual(secondCalculation, firstCalculation);
  assert.equal(firstCalculation.planType, "normal");
  assert.equal(firstCalculation.daysUntilDeadline, 42);

  const options = {
    deadline: deadlineDate,
    now: referenceDate,
    subject: "Mathematik",
  };
  const firstSchedule = scheduleStudyPlan(firstCalculation, options, []);
  const secondSchedule = scheduleStudyPlan(firstCalculation, options, []);
  assert.deepEqual(secondSchedule, firstSchedule);
  assert.ok(firstSchedule.sessions.length > 0);

  const plannedWeeks = new Set(
    firstSchedule.sessions.map((session) => {
      const week = new Date(session.start);
      week.setHours(0, 0, 0, 0);
      week.setDate(week.getDate() - ((week.getDay() + 6) % 7));
      return week.getTime();
    }),
  );
  assert.ok(plannedWeeks.size >= 4);
});

test("verwendet die aktualisierten Deadline- und Seitenfaktoren", () => {
  const baseInput = {
    referenceDate: localDate(2026, 6, 1),
    deadlineDate: localDate(2026, 6, 22),
    difficulty: 3,
    priorKnowledge: 3,
    pages: 51,
    credits: 6,
  };

  assert.equal(calculateStudyPlan(baseInput).deadlineFactor, 1.1);
  assert.equal(
    calculateStudyPlan({ ...baseInput, deadlineDate: localDate(2026, 6, 16) }).deadlineFactor,
    1.1,
  );
  assert.equal(
    calculateStudyPlan({ ...baseInput, deadlineDate: localDate(2026, 6, 15) }).deadlineFactor,
    1.2,
  );
  assert.equal(
    calculateStudyPlan({ ...baseInput, deadlineDate: localDate(2026, 6, 11) }).deadlineFactor,
    1.2,
  );

  assert.equal(calculateStudyPlan({ ...baseInput, pages: 50 }).volumeFactor, 0.7);
  assert.equal(calculateStudyPlan({ ...baseInput, pages: 51 }).volumeFactor, 1.0);
  assert.equal(calculateStudyPlan({ ...baseInput, pages: 150 }).volumeFactor, 1.0);
  assert.equal(calculateStudyPlan({ ...baseInput, pages: 151 }).volumeFactor, 1.3);
  assert.equal(calculateStudyPlan({ ...baseInput, pages: 300 }).volumeFactor, 1.3);
  assert.equal(calculateStudyPlan({ ...baseInput, pages: 301 }).volumeFactor, 1.6);
});

test("begrenzt den Plan kontrolliert bei sehr wenig verfügbarer Zeit", () => {
  const referenceDate = localDate(2026, 6, 1, 8);
  const deadlineDate = localDate(2026, 6, 3);
  const calculation = calculateStudyPlan({
    referenceDate,
    deadlineDate,
    difficulty: 5,
    priorKnowledge: 1,
    pages: 300,
    credits: 10,
  });

  const schedule = scheduleStudyPlan(
    calculation,
    {
      deadline: deadlineDate,
      now: referenceDate,
      subject: "Mathematik",
    },
    [],
  );

  assert.equal(calculation.planType, "kritisch");
  assert.ok(schedule.sessionsNeeded > schedule.sessions.length);
  assert.equal(schedule.sessions.length, 4);
  assert.ok(schedule.warnings.some((warning) => warning.includes("höchstens 4")));
});

test("lässt erledigte Aufgaben bei der Umplanung unverändert", () => {
  const completedDueDate = localDate(2026, 5, 20);
  const result = replanOpenTasks({
    referenceDate: localDate(2026, 6, 1),
    deadlineDate: localDate(2026, 6, 15),
    allowedWeekdays: [1, 2, 3, 4, 5],
    tasks: [
      {
        id: "completed",
        dueDate: completedDueDate,
        estimatedMinutes: 120,
        difficulty: 4,
        completed: true,
      },
      {
        id: "open-1",
        dueDate: localDate(2026, 5, 22),
        estimatedMinutes: 60,
        difficulty: 2,
        completed: false,
      },
      {
        id: "open-2",
        dueDate: localDate(2026, 5, 23),
        estimatedMinutes: 180,
        difficulty: 5,
        completed: false,
      },
    ],
  });

  const completed = result.tasks.find((task) => task.id === "completed");
  assert.equal(completed.completed, true);
  assert.equal(completed.changed, false);
  assert.equal(completed.dueDate.getTime(), completedDueDate.getTime());

  const openTasks = result.tasks.filter((task) => !task.completed);
  assert.ok(openTasks.every((task) => task.changed));
  assert.ok(
    openTasks.every(
      (task) =>
        task.dueDate.getTime() >= localDate(2026, 6, 1).getTime() &&
        task.dueDate.getTime() < localDate(2026, 6, 15).getTime(),
    ),
  );
});

test("weist unvollständige oder unmögliche Eingaben kontrolliert zurück", () => {
  assert.throws(
    () =>
      calculateStudyPlan({
        referenceDate: localDate(2026, 6, 10),
        deadlineDate: localDate(2026, 6, 1),
        difficulty: 3,
        priorKnowledge: 3,
        pages: 100,
        credits: 6,
      }),
    (error) =>
      error instanceof AlgorithmInputError &&
      error.field === "deadlineDate",
  );

  assert.throws(
    () =>
      calculateStudyPlan({
        referenceDate: localDate(2026, 6, 1),
        deadlineDate: localDate(2026, 6, 10),
        difficulty: 3,
        priorKnowledge: 3,
        pages: 0,
        credits: 6,
      }),
    (error) => error instanceof AlgorithmInputError && error.field === "pages",
  );
});
