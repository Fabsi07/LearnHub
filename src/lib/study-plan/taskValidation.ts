export interface ValidatedTaskInput {
  title?: string;
  description?: string | null;
  estimatedMinutes?: number;
  difficulty?: number;
  dueDate?: Date;
  completed?: boolean;
}

interface ValidTaskInput {
  data: ValidatedTaskInput;
}

interface InvalidTaskInput {
  error: string;
}

export type TaskValidationResult = ValidTaskInput | InvalidTaskInput;

function parseInteger(value: unknown): number | null {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isInteger(parsed) ? parsed : null;
}

export function validateTaskInput(
  body: unknown,
  mode: "create" | "patch",
): TaskValidationResult {
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    return { error: "Ungültiger Anfrage-Body." };
  }

  const input = body as Record<string, unknown>;
  const data: ValidatedTaskInput = {};

  if (mode === "create" || "title" in input) {
    if (typeof input.title !== "string" || !input.title.trim()) {
      return { error: "Ein Titel ist erforderlich." };
    }
    data.title = input.title.trim();
  }

  if ("description" in input) {
    if (input.description === null) {
      data.description = null;
    } else if (typeof input.description === "string") {
      data.description = input.description.trim() || null;
    } else {
      return { error: "Die Beschreibung ist ungültig." };
    }
  }

  if (mode === "create" || "estimatedMinutes" in input) {
    const estimatedMinutes = parseInteger(input.estimatedMinutes);
    if (estimatedMinutes === null || estimatedMinutes <= 0) {
      return { error: "Der geschätzte Aufwand muss eine positive Ganzzahl sein." };
    }
    data.estimatedMinutes = estimatedMinutes;
  }

  if (mode === "create" || "difficulty" in input) {
    const difficulty = parseInteger(input.difficulty);
    if (difficulty === null || difficulty < 1 || difficulty > 5) {
      return { error: "Die Schwierigkeit muss zwischen 1 und 5 liegen." };
    }
    data.difficulty = difficulty;
  }

  if (mode === "create" || "dueDate" in input) {
    if (typeof input.dueDate !== "string" || !input.dueDate.trim()) {
      return { error: "Ein Fälligkeitsdatum ist erforderlich." };
    }

    const dueDate = new Date(input.dueDate);
    if (Number.isNaN(dueDate.getTime())) {
      return { error: "Ungültiges Fälligkeitsdatum." };
    }
    data.dueDate = dueDate;
  }

  if ("completed" in input) {
    if (typeof input.completed !== "boolean") {
      return { error: "Der Aufgabenstatus ist ungültig." };
    }
    data.completed = input.completed;
  }

  if (mode === "patch" && Object.keys(data).length === 0) {
    return { error: "Keine Änderungen übergeben." };
  }

  return { data };
}
