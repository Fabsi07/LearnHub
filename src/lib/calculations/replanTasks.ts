export interface ReplanningTask {
  id: string;
  dueDate: Date;
  estimatedMinutes: number;
  difficulty: 1 | 2 | 3 | 4 | 5;
  completed: boolean;
}

export interface ReplanTasksInput {
  tasks: readonly ReplanningTask[];
  referenceDate: Date;
  deadlineDate: Date;
  /** 0 = Sonntag bis 6 = Samstag. Standard: alle Tage. */
  allowedWeekdays?: readonly number[];
}

export interface ReplannedTask {
  id: string;
  dueDate: Date;
  completed: boolean;
  changed: boolean;
}

export interface ReplanTasksResult {
  tasks: ReplannedTask[];
  warnings: string[];
}

export class ReplanTasksInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ReplanTasksInputError";
  }
}

function startOfDay(value: Date): Date {
  const result = new Date(value);
  result.setHours(0, 0, 0, 0);
  return result;
}

function addDays(value: Date, days: number): Date {
  const result = new Date(value);
  result.setDate(result.getDate() + days);
  return result;
}

function isValidDate(value: Date): boolean {
  return value instanceof Date && Number.isFinite(value.getTime());
}

function validateInput(input: ReplanTasksInput): number[] {
  if (!input || typeof input !== "object") {
    throw new ReplanTasksInputError("Umplanungs-Eingaben fehlen.");
  }
  if (!Array.isArray(input.tasks)) {
    throw new ReplanTasksInputError("tasks muss eine Liste sein.");
  }
  if (!isValidDate(input.referenceDate) || !isValidDate(input.deadlineDate)) {
    throw new ReplanTasksInputError("Bezugs- und Zieldatum müssen gültig sein.");
  }

  const referenceDate = startOfDay(input.referenceDate);
  const deadlineDate = startOfDay(input.deadlineDate);
  if (deadlineDate.getTime() <= referenceDate.getTime()) {
    throw new ReplanTasksInputError("Das Zieldatum muss nach dem Bezugsdatum liegen.");
  }

  const allowedWeekdays = [...(input.allowedWeekdays ?? [0, 1, 2, 3, 4, 5, 6])];
  if (
    allowedWeekdays.length === 0 ||
    allowedWeekdays.some((day) => !Number.isInteger(day) || day < 0 || day > 6)
  ) {
    throw new ReplanTasksInputError("allowedWeekdays enthält ungültige Wochentage.");
  }

  const ids = new Set<string>();
  for (const task of input.tasks) {
    if (
      !task ||
      typeof task.id !== "string" ||
      !task.id ||
      ids.has(task.id) ||
      !isValidDate(task.dueDate) ||
      !Number.isInteger(task.estimatedMinutes) ||
      task.estimatedMinutes <= 0 ||
      !Number.isInteger(task.difficulty) ||
      task.difficulty < 1 ||
      task.difficulty > 5 ||
      typeof task.completed !== "boolean"
    ) {
      throw new ReplanTasksInputError("Mindestens eine Aufgabe ist ungültig.");
    }
    ids.add(task.id);
  }

  return allowedWeekdays;
}

function workload(task: ReplanningTask): number {
  return task.estimatedMinutes * (0.8 + task.difficulty * 0.1);
}

/**
 * Verteilt ausschließlich offene Aufgaben neu. Erledigte Aufgaben behalten
 * Status und Fälligkeitsdatum unverändert.
 */
export function replanOpenTasks(input: ReplanTasksInput): ReplanTasksResult {
  const allowedWeekdays = validateInput(input);
  const referenceDate = startOfDay(input.referenceDate);
  const deadlineDate = startOfDay(input.deadlineDate);
  const planningDays: Date[] = [];

  for (
    let day = new Date(referenceDate);
    day.getTime() < deadlineDate.getTime();
    day = addDays(day, 1)
  ) {
    if (allowedWeekdays.includes(day.getDay())) planningDays.push(new Date(day));
  }

  const openTasks = input.tasks
    .filter((task) => !task.completed)
    .sort((left, right) => {
      const dueDateDelta = left.dueDate.getTime() - right.dueDate.getTime();
      if (dueDateDelta !== 0) return dueDateDelta;
      return left.id < right.id ? -1 : left.id > right.id ? 1 : 0;
    });

  if (openTasks.length === 0 || planningDays.length === 0) {
    return {
      tasks: input.tasks.map((task) => ({
        id: task.id,
        dueDate: new Date(task.dueDate),
        completed: task.completed,
        changed: false,
      })),
      warnings:
        planningDays.length === 0 && openTasks.length > 0
          ? ["Vor dem Zieldatum stehen keine erlaubten Planungstage zur Verfügung."]
          : [],
    };
  }

  const totalWorkload = openTasks.reduce((sum, task) => sum + workload(task), 0);
  let cumulativeWorkload = 0;
  const replannedDates = new Map<string, Date>();

  for (const task of openTasks) {
    cumulativeWorkload += workload(task);
    const progress = cumulativeWorkload / totalWorkload;
    const dayIndex = Math.min(
      planningDays.length - 1,
      Math.max(0, Math.ceil(progress * planningDays.length) - 1),
    );
    replannedDates.set(task.id, planningDays[dayIndex]);
  }

  return {
    tasks: input.tasks.map((task) => {
      const replannedDate = replannedDates.get(task.id);
      if (!replannedDate || task.completed) {
        return {
          id: task.id,
          dueDate: new Date(task.dueDate),
          completed: task.completed,
          changed: false,
        };
      }
      return {
        id: task.id,
        dueDate: new Date(replannedDate),
        completed: false,
        changed: replannedDate.getTime() !== task.dueDate.getTime(),
      };
    }),
    warnings: [],
  };
}
