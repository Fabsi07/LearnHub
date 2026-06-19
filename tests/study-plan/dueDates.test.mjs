import assert from "node:assert/strict";
import test from "node:test";

import { isOpenTaskOverdue, isPastDueDate } from "../../src/lib/study-plan/dueDates.ts";

const reference = new Date(2026, 5, 19, 12, 0, 0);

test("erkennt Faelligkeitsdaten vor dem Referenztag als ueberfaellig", () => {
  assert.equal(isPastDueDate(new Date(2026, 5, 18, 23, 59, 59), reference), true);
});

test("markiert heutige oder zukuenftige Aufgaben nicht als ueberfaellig", () => {
  assert.equal(isPastDueDate(new Date(2026, 5, 19, 0, 0, 0), reference), false);
  assert.equal(isPastDueDate(new Date(2026, 5, 20, 0, 0, 0), reference), false);
});

test("markiert nur offene Aufgaben als ueberfaellig", () => {
  assert.equal(
    isOpenTaskOverdue(
      { completed: false, dueDate: new Date(2026, 5, 18, 0, 0, 0) },
      reference,
    ),
    true,
  );
  assert.equal(
    isOpenTaskOverdue(
      { completed: true, dueDate: new Date(2026, 5, 18, 0, 0, 0) },
      reference,
    ),
    false,
  );
});
