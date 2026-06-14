import assert from "node:assert/strict";
import test from "node:test";

import { validateTaskInput } from "../../src/lib/study-plan/taskValidation.ts";

const validTask = {
  title: "Übungsblatt bearbeiten",
  estimatedMinutes: 90,
  difficulty: 4,
  dueDate: "2026-06-20T00:00:00.000Z",
};

test("validiert und normalisiert eine neue Aufgabe", () => {
  const result = validateTaskInput(
    { ...validTask, title: "  Übungsblatt bearbeiten  ", description: "  Kapitel 3  " },
    "create",
  );

  assert.equal(result.error, undefined);
  assert.equal(result.data.title, "Übungsblatt bearbeiten");
  assert.equal(result.data.description, "Kapitel 3");
  assert.equal(result.data.estimatedMinutes, 90);
  assert.equal(result.data.difficulty, 4);
  assert.equal(result.data.dueDate.toISOString(), validTask.dueDate);
});

test("verlangt beim Anlegen alle D3-Pflichtfelder", () => {
  for (const field of ["title", "estimatedMinutes", "difficulty", "dueDate"]) {
    const input = { ...validTask };
    delete input[field];

    const result = validateTaskInput(input, "create");
    assert.ok(result.error, `${field} muss erforderlich sein`);
  }
});

test("lehnt ungültigen Aufwand ab, statt einen Standardwert zu verwenden", () => {
  for (const estimatedMinutes of [0, -15, 1.5, "unbekannt"]) {
    const result = validateTaskInput({ ...validTask, estimatedMinutes }, "create");
    assert.match(result.error, /Aufwand/);
  }
});

test("lehnt ungültige Schwierigkeit ab, statt einen Standardwert zu verwenden", () => {
  for (const difficulty of [0, 6, 2.5, "schwer"]) {
    const result = validateTaskInput({ ...validTask, difficulty }, "create");
    assert.match(result.error, /Schwierigkeit/);
  }
});

test("weist ungültige Werte auch beim Bearbeiten zurück", () => {
  assert.match(validateTaskInput({ title: "   " }, "patch").error, /Titel/);
  assert.match(validateTaskInput({ estimatedMinutes: 0 }, "patch").error, /Aufwand/);
  assert.match(validateTaskInput({ difficulty: 9 }, "patch").error, /Schwierigkeit/);
  assert.match(validateTaskInput({ dueDate: "kein-datum" }, "patch").error, /Fälligkeitsdatum/);
  assert.match(validateTaskInput({ completed: "ja" }, "patch").error, /status/i);
});

test("akzeptiert Statusänderungen und lehnt leere Änderungen ab", () => {
  assert.deepEqual(validateTaskInput({ completed: true }, "patch"), {
    data: { completed: true },
  });
  assert.match(validateTaskInput({}, "patch").error, /Keine Änderungen/);
});
