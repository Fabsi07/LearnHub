// Lernplan-Scheduler: verteilt die vom Algorithmus berechneten Gesamtstunden
// auf konkrete, datierte 2-h-Lerneinheiten bis zur Deadline.
//
// Reine Funktion ohne Seiteneffekte – gleiche Eingaben ergeben den gleichen
// Plan (docs/Algorithmus/Ausgabeformat.md: "Die Ausgabe soll deterministisch
// sein"). Logik und Konstanten: docs/lernplan-umsetzung.md §6.

import type { CalEvent } from "@/components/calendar/events";
import { DAY_START_HOUR } from "@/components/calendar/events";
import type { AlgorithmResult } from "@/lib/calculations/studyPlanAlgorithm";

/** Dauer einer Lerneinheit in Stunden. */
export const SLOT_HOURS = 2;
/** Hartes Limit gegen Überlastung. */
export const MAX_SESSIONS_PER_WEEK = 5;
/** Bevorzugter Beginn einer Einheit (16:00 Uhr, Entscheidung 8.2). */
export const PREFERRED_START_HOUR = 16;
/** Maximal zwei Einheiten am selben Tag. */
export const MAX_SESSIONS_PER_DAY = 2;
/** Keine Einheit endet nach 21:00 Uhr – auch unter der Woche schlaffreundlich. */
export const LATEST_END_HOUR = 21;
/** Mindestpause zwischen zwei Einheiten am selben Tag (Minuten). */
export const SESSION_GAP_MIN = 30;

export interface ScheduleOptions {
  /** Klausur-/Zieldatum; am Tag selbst wird nicht mehr geplant. */
  deadline: Date;
  /** Erster planbarer Tag (Default: morgen). */
  startDate?: Date;
  /** Erlaubte Wochentage, 0 = So … 6 = Sa (Default: Mo–Sa, Entscheidung 8.1). */
  allowedWeekdays?: number[];
  /** Bevorzugte Startstunde der Einheiten (Default: 16). */
  preferredStartHour?: number;
  /** Späteste Endzeit einer Einheit in Stunden (Default: 21). */
  latestEndHour?: number;
  /** Maximale Einheiten pro Tag (Default: 2). */
  maxSessionsPerDay?: number;
}

export interface ScheduledSession {
  start: Date;
  /** start + 2 h */
  end: Date;
  /** Voller Phasenname aus dem Algorithmus, z. B. "Phase 1 – Grundlagen aufbauen". */
  phaseName: string;
  /** Kurzname ohne Präfix, z. B. "Grundlagen aufbauen". */
  shortPhase: string;
  /** Konkrete Aufgaben für diese Einheit (Phasen-Template). */
  tasks: string[];
}

export interface ScheduleResult {
  sessions: ScheduledSession[];
  warnings: string[];
  /** Wie viele Einheiten rechnerisch nötig wären. */
  sessionsNeeded: number;
}

// ─── Phasen-Templates (konkrete Aufgaben je Einheit) ─────────────────────────
// Kurze, machbare To-dos je Phase – Stil gemäß docs/Algorithmus/Ausgabeformat.md §3.

const PHASE_TASKS: Record<string, string[]> = {
  // Normaler Lernplan
  "Grundlagen aufbauen": [
    "Skript/Folien zum nächsten Thema durcharbeiten",
    "Wichtige Begriffe und Formeln notieren",
    "Kurze Zusammenfassung schreiben",
  ],
  Vertiefung: [
    "Übungsaufgaben zum aktuellen Thema lösen",
    "Lernkarten erstellen oder erweitern",
    "Offene Verständnisfragen klären",
  ],
  Anwendung: [
    "Übungsblatt oder Beispiel-Klausuraufgaben bearbeiten",
    "Fehler analysieren und in Fehlerliste notieren",
  ],
  Wiederholung: [
    "Lernkarten und Zusammenfassungen wiederholen",
    "Formeln und Definitionen abfragen",
    "Persönliche Fehlerliste durchgehen",
  ],
  // Kritischer Lernplan
  Priorisierung: [
    "Alle Themen in A-, B- und C-Themen einteilen",
    "Lernreihenfolge festlegen (A-Themen zuerst)",
  ],
  "Kernstoff erarbeiten": [
    "Wichtigstes offenes A-Thema erarbeiten",
    "Kompakte Zusammenfassung oder Lernkarten dazu erstellen",
  ],
  "Aufgaben & Anwendung": [
    "Altklausur- oder Übungsaufgaben zum Thema lösen",
    "Fehlerliste ergänzen",
  ],
};

const FALLBACK_TASKS = ["Lerneinheit gemäß Plan bearbeiten"];

function shortPhaseName(phaseName: string): string {
  return phaseName.replace(/^Phase \d+ – /, "");
}

// ─── Datums-Helfer ────────────────────────────────────────────────────────────

function startOfDay(d: Date): Date {
  const out = new Date(d);
  out.setHours(0, 0, 0, 0);
  return out;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

const DAY_MS = 24 * 60 * 60 * 1000;

// ─── Slot-Suche ───────────────────────────────────────────────────────────────

/**
 * True, wenn [start, end) mit einem bestehenden Termin kollidiert.
 * Ganztägige Events blockieren kein konkretes Zeitfenster (analog
 * overlapsAnyDhbwEvent in components/calendar/events.ts).
 */
function collides(start: Date, end: Date, blockers: { start: Date; end: Date; allDay?: boolean }[]): boolean {
  return blockers.some(
    (b) =>
      !b.allDay &&
      start.getTime() < b.end.getTime() &&
      end.getTime() > b.start.getTime(),
  );
}

/**
 * Sucht den ersten freien 2-h-Block an einem Tag: zuerst ab der bevorzugten
 * Startzeit aufwärts (30-min-Raster), dann unterhalb davon abwärts bis zum
 * Tagesfenster-Beginn. Keine Einheit endet nach `latestEndHour`, damit auch
 * unter der Woche genug Abstand zum Schlafengehen bleibt.
 * null, wenn der Tag voll ist.
 */
function findFreeSlot(
  day: Date,
  preferredStartHour: number,
  latestEndHour: number,
  blockers: { start: Date; end: Date; allDay?: boolean }[],
  notBefore: Date,
): { start: Date; end: Date } | null {
  const slotMin = SLOT_HOURS * 60;
  const windowStart = DAY_START_HOUR * 60;
  const windowEnd = latestEndHour * 60; // exklusiv; letzter Start = windowEnd - slotMin
  if (windowEnd - slotMin < windowStart) return null;
  const preferred = Math.min(Math.max(preferredStartHour * 60, windowStart), windowEnd - slotMin);

  // Kandidaten-Startminuten: bevorzugt → später → früher
  const candidates: number[] = [];
  for (let m = preferred; m <= windowEnd - slotMin; m += 30) candidates.push(m);
  for (let m = preferred - 30; m >= windowStart; m -= 30) candidates.push(m);

  for (const minutes of candidates) {
    const start = new Date(day);
    start.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
    if (start.getTime() < notBefore.getTime()) continue;
    const end = new Date(start.getTime() + slotMin * 60 * 1000);
    if (!collides(start, end, blockers)) return { start, end };
  }
  return null;
}

// ─── Phasen-Zuteilung ─────────────────────────────────────────────────────────

/**
 * Verteilt `total` Einheiten anteilig (Prozentwerte) auf die Phasen –
 * Largest-Remainder-Verfahren, damit die Summe exakt aufgeht.
 */
function distributeByPercentage(percentages: number[], total: number): number[] {
  const raw = percentages.map((p) => (p / 100) * total);
  const counts = raw.map(Math.floor);
  let rest = total - counts.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ frac: v - Math.floor(v), i }))
    .sort((a, b) => b.frac - a.frac);
  for (const { i } of order) {
    if (rest <= 0) break;
    counts[i]++;
    rest--;
  }
  return counts;
}

// ─── Hauptfunktion ────────────────────────────────────────────────────────────

export function scheduleStudyPlan(
  result: AlgorithmResult,
  options: ScheduleOptions,
  existingEvents: CalEvent[],
): ScheduleResult {
  const warnings: string[] = [];
  const now = new Date();
  const deadline = startOfDay(options.deadline);
  const firstDay = startOfDay(options.startDate ?? addDays(now, 1));
  const allowedWeekdays = options.allowedWeekdays ?? [1, 2, 3, 4, 5, 6]; // Mo–Sa
  const preferredStartHour = options.preferredStartHour ?? PREFERRED_START_HOUR;
  const latestEndHour = options.latestEndHour ?? LATEST_END_HOUR;
  const maxPerDay = options.maxSessionsPerDay ?? MAX_SESSIONS_PER_DAY;

  let sessionsNeeded = Math.max(1, Math.ceil(result.totalHours / SLOT_HOURS));
  const originallyNeeded = sessionsNeeded;

  // Planbare Tage: [firstDay, deadline) an erlaubten Wochentagen
  const candidateDays: Date[] = [];
  for (let d = new Date(firstDay); d.getTime() < deadline.getTime(); d = addDays(d, 1)) {
    if (allowedWeekdays.includes(d.getDay())) candidateDays.push(new Date(d));
  }

  if (candidateDays.length === 0) {
    warnings.push("Vor der Deadline liegen keine planbaren Tage mehr.");
    return { sessions: [], warnings, sessionsNeeded };
  }

  // Kapazität: max. 5 Einheiten pro Woche, max. 2 pro Tag
  const weeks = Math.max(1, Math.ceil((deadline.getTime() - firstDay.getTime()) / (7 * DAY_MS)));
  const capacity = Math.min(weeks * MAX_SESSIONS_PER_WEEK, candidateDays.length * maxPerDay);
  if (sessionsNeeded > capacity) {
    warnings.push(
      `Rechnerisch wären ${sessionsNeeded} Lerneinheiten nötig, bis zur Deadline passen aber höchstens ${capacity} ` +
        `(max. ${MAX_SESSIONS_PER_WEEK} pro Woche). Geplant werden ${capacity} Einheiten – priorisiere die wichtigsten Inhalte.`,
    );
    sessionsNeeded = capacity;
  }

  // Einheiten pro Woche: gleichmäßig verteilen, gedeckelt auf MAX.
  // Kein künstliches Minimum – bei wenig Aufwand und viel Zeit sollen die
  // Einheiten (inkl. Wiederholung) bis zur Deadline gestreckt werden.
  const perWeek = Math.min(MAX_SESSIONS_PER_WEEK, Math.max(1, Math.ceil(sessionsNeeded / weeks)));

  // Tage in Wochen-Chunks gruppieren (7-Tage-Fenster ab firstDay)
  const weekChunks = new Map<number, Date[]>();
  for (const day of candidateDays) {
    const weekIndex = Math.floor((day.getTime() - firstDay.getTime()) / (7 * DAY_MS));
    const chunk = weekChunks.get(weekIndex) ?? [];
    chunk.push(day);
    weekChunks.set(weekIndex, chunk);
  }

  // Pro Woche `perWeek` Tage möglichst gleichmäßig wählen; volle Tage werden
  // durch die übrigen Tage der Woche ersetzt (Fallback-Reihenfolge). Reicht das
  // nicht, darf in einem zweiten Durchgang eine zweite Einheit auf bereits
  // belegte Tage gelegt werden (max. 2/Tag, mit Pause dazwischen).
  const blockers = existingEvents.map((e) => ({ start: e.start, end: e.end, allDay: e.allDay }));
  const placed: { start: Date; end: Date }[] = [];
  const perDayCount = new Map<string, number>();
  let remaining = sessionsNeeded;

  const gapMs = SESSION_GAP_MIN * 60 * 1000;
  // Eigene platzierte Einheiten blockieren mit ±Pause, damit zwei Blöcke am
  // selben Tag nicht nahtlos aneinanderkleben (4 h am Stück).
  const paddedPlaced = () =>
    placed.map((p) => ({
      start: new Date(p.start.getTime() - gapMs),
      end: new Date(p.end.getTime() + gapMs),
    }));

  function tryPlace(day: Date): boolean {
    const key = day.toDateString();
    if ((perDayCount.get(key) ?? 0) >= maxPerDay) return false;
    const slot = findFreeSlot(
      day,
      preferredStartHour,
      latestEndHour,
      [...blockers, ...paddedPlaced()],
      now,
    );
    if (!slot) return false;
    placed.push(slot);
    perDayCount.set(key, (perDayCount.get(key) ?? 0) + 1);
    return true;
  }

  const sortedWeekIndices = [...weekChunks.keys()].sort((a, b) => a - b);
  for (const weekIndex of sortedWeekIndices) {
    if (remaining <= 0) break;
    const chunk = weekChunks.get(weekIndex)!;
    const quota = Math.min(perWeek, remaining, chunk.length * maxPerDay);

    // Gleichmäßig verteilte Wunsch-Tage zuerst, danach die restlichen als Fallback
    const dayQuota = Math.min(quota, chunk.length);
    const pickOrder: Date[] = [];
    if (dayQuota >= chunk.length) {
      pickOrder.push(...chunk);
    } else {
      const wanted = new Set<number>();
      for (let i = 0; i < dayQuota; i++) {
        wanted.add(dayQuota === 1 ? 0 : Math.round((i * (chunk.length - 1)) / (dayQuota - 1)));
      }
      pickOrder.push(...[...wanted].sort((a, b) => a - b).map((i) => chunk[i]));
      chunk.forEach((day, i) => {
        if (!wanted.has(i)) pickOrder.push(day);
      });
    }

    let placedThisWeek = 0;
    // Durchgang 1: höchstens eine Einheit pro Tag
    for (const day of pickOrder) {
      if (placedThisWeek >= quota || remaining <= 0) break;
      if ((perDayCount.get(day.toDateString()) ?? 0) >= 1) continue;
      if (tryPlace(day)) {
        placedThisWeek++;
        remaining--;
      }
    }
    // Durchgang 2: zweite Einheit auf bereits belegten Tagen (max. 2/Tag)
    for (const day of pickOrder) {
      if (placedThisWeek >= quota || remaining <= 0) break;
      if (tryPlace(day)) {
        placedThisWeek++;
        remaining--;
      }
    }
  }

  if (remaining > 0) {
    warnings.push(
      `${remaining} von ${sessionsNeeded} Einheiten konnten wegen Terminkonflikten nicht platziert werden.`,
    );
  }

  // Chronologisch sortieren und Phasen zuteilen (Grundlagen früh, Wiederholung spät)
  placed.sort((a, b) => a.start.getTime() - b.start.getTime());
  const phaseCounts = distributeByPercentage(
    result.phases.map((p) => p.percentage),
    placed.length,
  );

  const sessions: ScheduledSession[] = [];
  let phaseIndex = 0;
  let usedInPhase = 0;
  for (const slot of placed) {
    while (phaseIndex < result.phases.length - 1 && usedInPhase >= phaseCounts[phaseIndex]) {
      phaseIndex++;
      usedInPhase = 0;
    }
    const phase = result.phases[phaseIndex];
    const short = shortPhaseName(phase.name);
    sessions.push({
      start: slot.start,
      end: slot.end,
      phaseName: phase.name,
      shortPhase: short,
      tasks: PHASE_TASKS[short] ?? FALLBACK_TASKS,
    });
    usedInPhase++;
  }

  // Hinweis aus dem Konzept: kritischer Plan zeigt trotzdem max. 2 h/Tag
  if (result.planType === "kritisch" && originallyNeeded > sessionsNeeded) {
    warnings.push(
      "Der berechnete Lernaufwand ist höher als die empfohlene maximale Wochenlernzeit.",
    );
  }

  return { sessions, warnings, sessionsNeeded: originallyNeeded };
}
