// Geteilte Typen, Serializer und Validierungs-Helfer für die Lernplan-Features.
// Gemeinsame Datentypen für Lernplan-API und UI.

import type { CalendarEvent, GoalType, StudyPlan, Task } from "@prisma/client";

export const GOAL_TYPES: GoalType[] = [
  "KLAUSUR",
  "ABGABE",
  "PRAESENTATION",
  "SELBSTLERNZIEL",
  "SONSTIGES",
];

// ─── DTOs (serialisierte Formen für die API-Antworten) ─────────────────────────

export interface TaskDTO {
  id: string;
  title: string;
  description: string | null;
  estimatedMinutes: number;
  difficulty: number;
  dueDate: string; // ISO
  completed: boolean;
  completedAt: string | null; // ISO
  calendarEvent: TaskCalendarEventDTO | null;
}

export interface TaskCalendarEventDTO {
  id: string;
  title: string;
  startsAt: string; // ISO
  endsAt: string; // ISO
}

export interface StudyPlanDTO {
  id: string;
  title: string;
  subject: string;
  description: string | null;
  goalType: GoalType;
  targetDate: string; // ISO
  // Algorithmus-Eingaben
  difficulty: number | null;
  priorKnowledge: number | null;
  pages: number | null;
  credits: number | null;
  // Algorithmus-Ergebnis
  totalHours: number | null;
  hoursPerDay: number | null;
  planType: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Listen-Eintrag der Übersicht – mit Fortschritts-Aggregaten. */
export interface StudyPlanSummaryDTO extends StudyPlanDTO {
  taskCount: number;
  completedTaskCount: number;
  nextTask: { id: string; title: string; dueDate: string } | null;
}

/** Detailansicht – mit voller Aufgabenliste. */
export interface StudyPlanDetailDTO extends StudyPlanDTO {
  tasks: TaskDTO[];
}

// ─── Serializer ────────────────────────────────────────────────────────────────

type SerializableTask = Task & {
  calendarEvent?: Pick<CalendarEvent, "id" | "title" | "startsAt" | "endsAt"> | null;
};

export function serializeTask(t: SerializableTask): TaskDTO {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    estimatedMinutes: t.estimatedMinutes,
    difficulty: t.difficulty,
    dueDate: t.dueDate.toISOString(),
    completed: t.completed,
    completedAt: t.completedAt ? t.completedAt.toISOString() : null,
    calendarEvent: t.calendarEvent
      ? {
          id: t.calendarEvent.id,
          title: t.calendarEvent.title,
          startsAt: t.calendarEvent.startsAt.toISOString(),
          endsAt: t.calendarEvent.endsAt.toISOString(),
        }
      : null,
  };
}

export function serializeStudyPlan(p: StudyPlan): StudyPlanDTO {
  return {
    id: p.id,
    title: p.title,
    subject: p.subject,
    description: p.description,
    goalType: p.goalType,
    targetDate: p.targetDate.toISOString(),
    difficulty: p.difficulty,
    priorKnowledge: p.priorKnowledge,
    pages: p.pages,
    credits: p.credits,
    totalHours: p.totalHours,
    hoursPerDay: p.hoursPerDay,
    planType: p.planType,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

// ─── Validierungs-Helfer ───────────────────────────────────────────────────────

/** Parst eine Ganzzahl im Bereich [min, max]; sonst null. */
export function toIntInRange(v: unknown, min: number, max: number): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n)) return null;
  const i = Math.round(n);
  if (i < min || i > max) return null;
  return i;
}

/** Parst eine positive Ganzzahl (> 0); sonst null. */
export function toPositiveInt(v: unknown): number | null {
  const n = typeof v === "number" ? v : typeof v === "string" ? Number(v) : NaN;
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n);
}

export function isValidGoalType(v: unknown): v is GoalType {
  return typeof v === "string" && (GOAL_TYPES as string[]).includes(v);
}
