/**
 * LearnHub – Lernplan-Algorithmus
 * Dokumentation: docs/Algorithmus/Algorithmus_neue_Formel.md
 */

export type PlanType = "normal" | "kritisch";

export const CRITICAL_STUDY_HOURS_PER_DAY = 2;

export interface AlgorithmInput {
  /** Bezugsdatum der Berechnung; macht die Funktion deterministisch. */
  referenceDate: Date;
  /** Datum der Klausur */
  deadlineDate: Date;
  /** Schwierigkeit der Klausur: 1 (leicht) – 5 (schwer) */
  difficulty: 1 | 2 | 3 | 4 | 5;
  /** Vorwissen des Users: 1 (wenig) – 5 (viel) */
  priorKnowledge: 1 | 2 | 3 | 4 | 5;
  /** Anzahl der Seiten / Folien */
  pages: number;
  /** ECTS-Punkte der Klausur: 1–10 */
  credits: number;
}

export interface AlgorithmResult {
  /** Tage bis zur Deadline */
  daysUntilDeadline: number;
  /** D-Faktor (Deadline) */
  deadlineFactor: number;
  /** S-Faktor (Schwierigkeit) */
  difficultyFactor: number;
  /** V-Faktor (Vorwissen) */
  knowledgeFactor: number;
  /** W-Faktor (Volumen/Seiten) */
  volumeFactor: number;
  /** C-Faktor (Credits) */
  creditFactor: number;
  /** Gesamtstunden = 25 × D × ((S+W+V+C)/4) */
  totalHours: number;
  /** Stunden pro Tag = Gesamtstunden / Tage */
  hoursPerDay: number;
  /** Plantyp: normal (≤2h/Tag) oder kritisch (>2h/Tag) */
  planType: PlanType;
  /** Phasen des Lernplans mit Stunden */
  phases: Phase[];
}

export interface Phase {
  name: string;
  percentage: number;
  hours: number;
  description: string;
}

export class AlgorithmInputError extends Error {
  readonly field: keyof AlgorithmInput;

  constructor(
    field: keyof AlgorithmInput,
    message: string,
  ) {
    super(message);
    this.name = "AlgorithmInputError";
    this.field = field;
  }
}

// ─── Faktoren ────────────────────────────────────────────────────────────────

function getDeadlineFactor(daysUntilDeadline: number): number {
  if (daysUntilDeadline > 90) return 1.4;  // > 3 Monate
  if (daysUntilDeadline > 60) return 1.1;  // 2–3 Monate
  if (daysUntilDeadline > 30) return 0.9;  // 1–2 Monate
  if (daysUntilDeadline > 14) return 1.2;  // 2–4 Wochen
  return 1.5;                               // < 2 Wochen
}

function getDifficultyFactor(difficulty: number): number {
  const map: Record<number, number> = { 1: 0.8, 2: 1.0, 3: 1.2, 4: 1.4, 5: 1.6 };
  return map[difficulty] ?? 1.0;
}

function getKnowledgeFactor(priorKnowledge: number): number {
  const map: Record<number, number> = { 1: 1.5, 2: 1.3, 3: 1.0, 4: 0.8, 5: 0.7 };
  return map[priorKnowledge] ?? 1.0;
}

function getVolumeFactor(pages: number): number {
  if (pages <= 50) return 0.7;
  if (pages <= 100) return 1.0;
  if (pages <= 150) return 1.3;
  return 1.6;
}

function getCreditFactor(credits: number): number {
  return credits * 0.2;
}

function assertValidDate(
  value: Date,
  field: "referenceDate" | "deadlineDate",
): void {
  if (!(value instanceof Date) || !Number.isFinite(value.getTime())) {
    throw new AlgorithmInputError(field, `${field} muss ein gültiges Datum sein.`);
  }
}

function assertIntegerInRange(
  value: number,
  field: "difficulty" | "priorKnowledge" | "credits",
  min: number,
  max: number,
): void {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new AlgorithmInputError(
      field,
      `${field} muss eine ganze Zahl zwischen ${min} und ${max} sein.`,
    );
  }
}

function calendarDayNumber(value: Date): number {
  return Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
}

function validateInput(input: AlgorithmInput): void {
  if (!input || typeof input !== "object") {
    throw new AlgorithmInputError("deadlineDate", "Algorithmus-Eingaben fehlen.");
  }

  assertValidDate(input.referenceDate, "referenceDate");
  assertValidDate(input.deadlineDate, "deadlineDate");
  assertIntegerInRange(input.difficulty, "difficulty", 1, 5);
  assertIntegerInRange(input.priorKnowledge, "priorKnowledge", 1, 5);
  assertIntegerInRange(input.credits, "credits", 1, 10);

  if (!Number.isInteger(input.pages) || input.pages <= 0) {
    throw new AlgorithmInputError("pages", "pages muss eine positive ganze Zahl sein.");
  }

  if (calendarDayNumber(input.deadlineDate) <= calendarDayNumber(input.referenceDate)) {
    throw new AlgorithmInputError(
      "deadlineDate",
      "deadlineDate muss nach referenceDate liegen.",
    );
  }
}

// ─── Phasen ──────────────────────────────────────────────────────────────────

function buildNormalPhases(totalHours: number): Phase[] {
  return [
    {
      name: "Phase 1 – Grundlagen aufbauen",
      percentage: 40,
      hours: Math.round(totalHours * 0.40 * 10) / 10,
      description: "Vorlesungsfolien, Skripte, Videos – Überblick verschaffen und Wissenslücken schließen",
    },
    {
      name: "Phase 2 – Vertiefung",
      percentage: 35,
      hours: Math.round(totalHours * 0.35 * 10) / 10,
      description: "Übungsaufgaben, eigene Zusammenfassungen, Lernkarten – Fachverständnis aufbauen",
    },
    {
      name: "Phase 3 – Anwendung",
      percentage: 15,
      hours: Math.round(totalHours * 0.15 * 10) / 10,
      description: "Übungsblätter, Beispielaufgaben, kleinere Klausuraufgaben",
    },
    {
      name: "Phase 4 – Wiederholung",
      percentage: 10,
      hours: Math.round(totalHours * 0.10 * 10) / 10,
      description: "Lernkarten, Zusammenfassungen, Formeln, Definitionen",
    },
  ];
}

function buildKritischPhases(totalHours: number): Phase[] {
  return [
    {
      name: "Phase 1 – Priorisierung",
      percentage: 10,
      hours: Math.round(totalHours * 0.10 * 10) / 10,
      description: "Themen in A/B/C einteilen – A (klausurrelevant) zuerst, C kann entfallen",
    },
    {
      name: "Phase 2 – Kernstoff erarbeiten",
      percentage: 50,
      hours: Math.round(totalHours * 0.50 * 10) / 10,
      description: "80% Verständnis mit minimalem Zeitaufwand – Zusammenfassungen, Lernkarten, KI-Erklärungen",
    },
    {
      name: "Phase 3 – Aufgaben & Anwendung",
      percentage: 30,
      hours: Math.round(totalHours * 0.30 * 10) / 10,
      description: "Altklausuren, Übungsaufgaben, typische Klausurfragen – direkt nach Themenverständnis",
    },
    {
      name: "Phase 4 – Wiederholung",
      percentage: 10,
      hours: Math.round(totalHours * 0.10 * 10) / 10,
      description: "Formeln, Definitionen, Lernkarten, persönliche Fehlerliste – keine neuen Themen mehr",
    },
  ];
}

// ─── Hauptfunktion ────────────────────────────────────────────────────────────

export function calculateStudyPlan(input: AlgorithmInput): AlgorithmResult {
  validateInput(input);

  const diffMs =
    calendarDayNumber(input.deadlineDate) - calendarDayNumber(input.referenceDate);
  const daysUntilDeadline = diffMs / (1000 * 60 * 60 * 24);

  const D = getDeadlineFactor(daysUntilDeadline);
  const S = getDifficultyFactor(input.difficulty);
  const V = getKnowledgeFactor(input.priorKnowledge);
  const W = getVolumeFactor(input.pages);
  const C = getCreditFactor(input.credits);

  // Formel: Gesamtstunden = 25 × D × ((S + W + V + C) / 4)
  const totalHours = Math.round(25 * D * ((S + W + V + C) / 4) * 10) / 10;
  const rawHoursPerDay = totalHours / daysUntilDeadline;
  const hoursPerDay = Math.round(rawHoursPerDay * 100) / 100;
  // Plantyp-Entscheidung basiert auf dem ungerundeten Wert, damit Grenzfaelle
  // (z.B. 2.004h/Tag → gerundet 2.00) korrekt als "kritisch" klassifiziert werden.
  const planType: PlanType =
    rawHoursPerDay > CRITICAL_STUDY_HOURS_PER_DAY ? "kritisch" : "normal";

  const phases =
    planType === "normal"
      ? buildNormalPhases(totalHours)
      : buildKritischPhases(totalHours);

  return {
    daysUntilDeadline,
    deadlineFactor: D,
    difficultyFactor: S,
    knowledgeFactor: V,
    volumeFactor: W,
    creditFactor: C,
    totalHours,
    hoursPerDay,
    planType,
    phases,
  };
}
