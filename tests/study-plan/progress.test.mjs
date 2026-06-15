import assert from "node:assert/strict";
import test from "node:test";

import { calculateTaskProgress } from "../../src/lib/study-plan/progress.ts";

test("liefert für einen leeren Lernplan null Prozent", () => {
  assert.deepEqual(calculateTaskProgress([]), {
    taskCount: 0,
    completedTaskCount: 0,
    percentage: 0,
  });
});

test("leitet den Fortschritt aus erledigten Aufgaben ab", () => {
  assert.deepEqual(
    calculateTaskProgress([
      { completed: true },
      { completed: false },
      { completed: true },
    ]),
    {
      taskCount: 3,
      completedTaskCount: 2,
      percentage: 67,
    },
  );
});

test("liefert bei vollständig erledigten Aufgaben hundert Prozent", () => {
  assert.deepEqual(
    calculateTaskProgress([{ completed: true }, { completed: true }]),
    {
      taskCount: 2,
      completedTaskCount: 2,
      percentage: 100,
    },
  );
});
