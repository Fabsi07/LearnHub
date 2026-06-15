// Lernplan-Scheduler: verteilt die vom Algorithmus berechneten Gesamtstunden
// auf konkrete, datierte 2-h-Lerneinheiten bis zur Deadline.
//
// Reine Funktion ohne Seiteneffekte – gleiche Eingaben ergeben den gleichen
// Plan (docs/Algorithmus/Ausgabeformat.md: "Die Ausgabe soll deterministisch
// sein"). Logik und Konstanten: docs/lernplan-umsetzung.md §6.

import type { CalEvent } from "@/components/calendar/events";
import {
  DAY_START_HOUR,
  eventOverlapsDay,
  isLernsessionEvent,
} from "@/components/calendar/events";
import type { AlgorithmResult } from "@/lib/calculations/studyPlanAlgorithm";

/** Dauer einer Lerneinheit in Stunden. */
export const SLOT_HOURS = 2;
/** Hartes Limit gegen Überlastung. */
export const MAX_SESSIONS_PER_WEEK = 5;
/** Bevorzugter Beginn einer Einheit (16:00 Uhr, Entscheidung 8.2). */
export const PREFERRED_START_HOUR = 16;
/** Maximal zwei Einheiten am selben Tag (normaler Uni-Tag). */
export const MAX_SESSIONS_PER_DAY = 2;
/**
 * An "freien" Tagen sind bis zu 3 Einheiten (= 6 h) möglich: am Wochenende
 * sowie an Wochentagen mit höchstens einem Hochschul-Block (Uni frei/fast frei).
 */
export const MAX_SESSIONS_PER_DAY_FREE = 3;
/** Bis zu so vielen Hochschul-Blöcken gilt ein Wochentag noch als "frei". */
export const LIGHT_UNI_DAY_MAX_BLOCKS = 1;
/** Empfohlene maximale Lernzeit pro Tag in Stunden (kritische Anmerkung darüber). */
export const MAX_RECOMMENDED_HOURS_PER_DAY = 6;
/** Ab so vielen Einheiten desselben Fachs pro Woche gibt es eine kritische Anmerkung. */
export const MAX_SUBJECT_SESSIONS_PER_WEEK = 5;
/** Bevorzugter Beginn an freien Tagen (Wochenende / keine Hochschul-Termine). */
export const FREE_DAY_START_HOUR = 10;
/** Keine Einheit endet nach 21:00 Uhr – auch unter der Woche schlaffreundlich. */
export const LATEST_END_HOUR = 21;
/** Mindestpause zwischen zwei Einheiten am selben Tag (Minuten). */
export const SESSION_GAP_MIN = 30;
/**
 * Puffer vor und nach Hochschul-Terminen (DHBW/ICS) in Minuten, in dem keine
 * Lerneinheit liegen darf – Zeit zum Hin-/Heimfahren und Essen.
 */
export const HOCHSCHUL_BUFFER_MIN = 30;

export interface ScheduleOptions {
  /** Klausur-/Zieldatum; am Tag selbst wird nicht mehr geplant. */
  deadline: Date;
  /** Erster planbarer Tag (Default: heute, falls noch ein 2-h-Slot passt, sonst morgen). */
  startDate?: Date;
  /** Für deterministische Planung (z. B. Tests/Preview). Default: aktuelle Zeit. */
  now?: Date;
  /** Erlaubte Wochentage, 0 = So … 6 = Sa (Default: Mo–So, alle Tage). */
  allowedWeekdays?: number[];
  /** Bevorzugte Startstunde der Einheiten (Default: 16). */
  preferredStartHour?: number;
  /** Späteste Endzeit einer Einheit in Stunden (Default: 21). */
  latestEndHour?: number;
  /** Maximale Einheiten pro Tag (Default: 2). */
  maxSessionsPerDay?: number;
  /** Puffer vor/nach Hochschul-Terminen in Minuten (Default: 30). */
  hochschulBufferMin?: number;
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

function isWeekend(d: Date): boolean {
  const wd = d.getDay();
  return wd === 0 || wd === 6;
}

/** Externe Hochschul-Termine (DHBW/ICS) – erkennbar an `source: "dhbw"`. */
function isHochschulEvent(e: CalEvent): boolean {
  return e.source === "dhbw";
}

/** Zahl der zeitgebundenen Blocker, die in `day` hineinreichen (Tages-Auslastung). */
function blockerLoad(
  day: Date,
  blockers: { start: Date; end: Date; allDay?: boolean }[],
): number {
  const dayStart = startOfDay(day).getTime();
  const dayEnd = dayStart + DAY_MS;
  return blockers.filter(
    (b) => !b.allDay && b.start.getTime() < dayEnd && b.end.getTime() > dayStart,
  ).length;
}

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
  const now = options.now ?? new Date();
  const deadline = startOfDay(options.deadline);
  // Startdatum: explizites startDate übernehmen; fehlt es, wird „heute" nur
  // dann gewählt, wenn auf dem 30-Min-Raster noch mindestens ein 2-h-Slot ins
  // Tageszeitfenster passt – andernfalls auf morgen zurückfallen, um die
  // Kapazitäts- und Wochenberechnung nicht zu überschätzen.
  const firstDay = (() => {
    if (options.startDate !== undefined) return startOfDay(options.startDate);
    const effectiveLatestEnd = (options.latestEndHour ?? LATEST_END_HOUR) * 60;
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const nextGridStart = Math.ceil(nowMinutes / 30) * 30;
    if (nextGridStart + SLOT_HOURS * 60 <= effectiveLatestEnd) return startOfDay(now);
    return startOfDay(addDays(now, 1));
  })();
  const allowedWeekdays = options.allowedWeekdays ?? [0, 1, 2, 3, 4, 5, 6]; // Mo–So
  const preferredStartHour = options.preferredStartHour ?? PREFERRED_START_HOUR;
  const latestEndHour = options.latestEndHour ?? LATEST_END_HOUR;
  const maxPerDay = options.maxSessionsPerDay ?? MAX_SESSIONS_PER_DAY;
  // Hochschul-Blöcke pro Tag (für Tageslimit + frühere Startzeit an freien Tagen)
  const uniBlockCountCache = new Map<string, number>();
  const uniBlockCount = (day: Date): number => {
    const key = day.toDateString();
    let count = uniBlockCountCache.get(key);
    if (count === undefined) {
      count = existingEvents.filter(
        (e) => !e.allDay && isHochschulEvent(e) && eventOverlapsDay(e, day),
      ).length;
      uniBlockCountCache.set(key, count);
    }
    return count;
  };
  // An freien Tagen (Wochenende oder höchstens ein Uni-Block) sind bis zu
  // 6 h (3 Einheiten) erlaubt; eine explizite Option deckelt alle Fälle.
  const isFreeDay = (day: Date): boolean =>
    isWeekend(day) || uniBlockCount(day) <= LIGHT_UNI_DAY_MAX_BLOCKS;
  const dayCap = (day: Date): number =>
    options.maxSessionsPerDay ?? (isFreeDay(day) ? MAX_SESSIONS_PER_DAY_FREE : maxPerDay);
  const existingSessionCountCache = new Map<string, number>();
  const existingSessionCount = (day: Date): number => {
    const key = day.toDateString();
    let count = existingSessionCountCache.get(key);
    if (count === undefined) {
      count = existingEvents.filter(
        (e) => !e.allDay && isLernsessionEvent(e) && eventOverlapsDay(e, day),
      ).length;
      existingSessionCountCache.set(key, count);
    }
    return count;
  };
  const availableDayCapacity = (day: Date): number =>
    Math.max(0, dayCap(day) - existingSessionCount(day));
  const hochschulBufferMin =
    typeof options.hochschulBufferMin === "number" && Number.isFinite(options.hochschulBufferMin)
      ? Math.max(0, options.hochschulBufferMin)
      : HOCHSCHUL_BUFFER_MIN;

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

  // Kapazität: max. 5 Einheiten pro Woche, Tageslimit je nach Wochentag
  const weeks = Math.max(1, Math.ceil((deadline.getTime() - firstDay.getTime()) / (7 * DAY_MS)));
  const dailyCapacity = candidateDays.reduce(
    (sum, d) => sum + availableDayCapacity(d),
    0,
  );
  const capacity = Math.min(weeks * MAX_SESSIONS_PER_WEEK, dailyCapacity);
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
  // Hochschul-Termine bekommen vor und nach dem Termin einen Puffer, in dem
  // keine Lerneinheit liegen darf (Heimfahrt/Essen). Eigene/lokale Termine
  // blockieren punktgenau.
  const hochschulBufferMs = hochschulBufferMin * 60 * 1000;
  const sessionGapMs = SESSION_GAP_MIN * 60 * 1000;
  const blockers = existingEvents.map((e) => {
    // Bestehende Lerneinheiten (z. B. aus früher eingetragenen Plänen) werden
    // mit ±Pause gepuffert, damit neue Einheiten nicht nahtlos daran kleben –
    // sonst greift die Mindestpause zwischen Lerneinheiten nicht.
    const padMs = e.allDay
      ? 0
      : isHochschulEvent(e)
        ? hochschulBufferMs
        : isLernsessionEvent(e)
          ? sessionGapMs
          : 0;
    return {
      start: padMs ? new Date(e.start.getTime() - padMs) : e.start,
      end: padMs ? new Date(e.end.getTime() + padMs) : e.end,
      allDay: e.allDay,
    };
  });
  const placed: { start: Date; end: Date }[] = [];
  const perDayCount = new Map<string, number>();
  let remaining = sessionsNeeded;

  // Eigene platzierte Einheiten blockieren mit ±Pause, damit zwei Blöcke am
  // selben Tag nicht nahtlos aneinanderkleben (4 h am Stück).
  const paddedPlaced = () =>
    placed.map((p) => ({
      start: new Date(p.start.getTime() - sessionGapMs),
      end: new Date(p.end.getTime() + sessionGapMs),
    }));

  // Freie Tage (Wochenende oder ohne Hochschul-Termine) starten früher,
  // damit mehrere Einheiten bequem mit Pausen Platz finden.
  const freeDayStart = (day: Date): number => {
    if (options.preferredStartHour != null) return preferredStartHour;
    return isWeekend(day) || uniBlockCount(day) === 0
      ? FREE_DAY_START_HOUR
      : preferredStartHour;
  };

  function tryPlace(day: Date): boolean {
    const key = day.toDateString();
    if ((perDayCount.get(key) ?? 0) >= availableDayCapacity(day)) return false;
    const slot = findFreeSlot(
      day,
      freeDayStart(day),
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
    const quota = Math.min(
      perWeek,
      remaining,
      chunk.reduce((sum, d) => sum + availableDayCapacity(d), 0),
    );

// Tage nach freier Zeit ordnen: Wochenenden und Tage mit wenig zeitgebundenen
// Terminen zuerst, damit freie Tage aktiv mit bis zu zwei Einheiten gefüllt werden.
    const pickOrder = [...chunk].sort((a, b) => {
      const weekendDelta = Number(isWeekend(b)) - Number(isWeekend(a));
      if (weekendDelta !== 0) return weekendDelta; // Wochenende zuerst
      const loadDelta = blockerLoad(a, blockers) - blockerLoad(b, blockers);
      if (loadDelta !== 0) return loadDelta; // weniger belegt = mehr Zeit zuerst
      return a.getTime() - b.getTime(); // sonst chronologisch
    });

    let placedThisWeek = 0;
    // Durchgang 1: erst eine Einheit pro Tag verteilen (ruhige Grundverteilung)
    for (const day of pickOrder) {
      if (placedThisWeek >= quota || remaining <= 0) break;
      if ((perDayCount.get(day.toDateString()) ?? 0) >= 1) continue;
      if (tryPlace(day)) {
        placedThisWeek++;
        remaining--;
      }
    }
    // Durchgang 2+: weitere Einheiten auf die freiesten Tage (Wochenende
    // zuerst), bis zum jeweiligen Tageslimit (Wochenende bis zu 3 × 2 h = 6 h).
    let progressed = true;
    while (progressed && placedThisWeek < quota && remaining > 0) {
      progressed = false;
      for (const day of pickOrder) {
        if (placedThisWeek >= quota || remaining <= 0) break;
        if (tryPlace(day)) {
          placedThisWeek++;
          remaining--;
          progressed = true;
        }
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

// ─── Workload-Analyse (kritische Anmerkungen) ─────────────────────────────────

/**
 * Prüft den kombinierten Lern-Workload (neu geplante Einheiten + bereits
 * vorhandene Lerneinheiten im Kalender) und liefert kritische Anmerkungen:
 *
 *  - mehr als MAX_RECOMMENDED_HOURS_PER_DAY Stunden Lernen an einem Tag
 *  - dasselbe Fach MAX_SUBJECT_SESSIONS_PER_WEEK-mal oder öfter in einer Woche
 *
 * Der Lernplan ist eine Basis, kein Pflichtprogramm – die Anmerkungen sollen
 * beim Organisieren helfen, nicht blockieren.
 */
export function analyzeWorkload(
  planned: { start: Date; end: Date }[],
  existingEvents: CalEvent[],
  subject: string,
): string[] {
  const notes: string[] = [];

  const blocks = [
    ...planned.map((s) => ({ start: s.start, end: s.end, subject })),
    ...existingEvents
      .filter((e) => !e.allDay && isLernsessionEvent(e))
      .map((e) => ({ start: e.start, end: e.end, subject: e.subject?.trim() ?? "" })),
  ];

  const pad = (n: number) => n.toString().padStart(2, "0");
  const fmtDay = (d: Date) => `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.`;
  const fmtHours = (h: number) =>
    h.toLocaleString("de-DE", { maximumFractionDigits: 1 });

  // 1) Zu viel Lernen an einem Tag – zu einer Meldung zusammengefasst,
  //    damit die Vorschau nicht mit Hinweisen geflutet wird.
  const hoursPerDay = new Map<number, number>();
  for (const b of blocks) {
    const key = startOfDay(b.start).getTime();
    const hours = (b.end.getTime() - b.start.getTime()) / 3_600_000;
    hoursPerDay.set(key, (hoursPerDay.get(key) ?? 0) + hours);
  }
  const overloadedDays = [...hoursPerDay.entries()]
    .filter(([, hours]) => hours > MAX_RECOMMENDED_HOURS_PER_DAY)
    .sort(([a], [b]) => a - b);
  if (overloadedDays.length === 1) {
    const [key, hours] = overloadedDays[0];
    notes.push(
      `Am ${fmtDay(new Date(key))} sind insgesamt ${fmtHours(hours)} Stunden Lernen geplant – ` +
        `mehr als die empfohlenen ${MAX_RECOMMENDED_HOURS_PER_DAY} Stunden pro Tag. Verteile die Einheiten möglichst auf mehrere Tage.`,
    );
  } else if (overloadedDays.length > 1) {
    const shown = overloadedDays
      .slice(0, 4)
      .map(([key]) => fmtDay(new Date(key)))
      .join(", ");
    const rest = overloadedDays.length - 4;
    const maxHours = Math.max(...overloadedDays.map(([, hours]) => hours));
    notes.push(
      `An ${overloadedDays.length} Tagen (${shown}${rest > 0 ? ` und ${rest} weiteren` : ""}) sind mehr als die ` +
        `empfohlenen ${MAX_RECOMMENDED_HOURS_PER_DAY} Stunden Lernen pro Tag geplant – in der Spitze ${fmtHours(maxHours)} Stunden. ` +
        `Verteile die Einheiten möglichst auf mehrere Tage.`,
    );
  }

  // 2) Ein Fach zu oft in derselben Woche
  const normalizedSubject = (s: string) => s.trim().toLocaleLowerCase("de-DE");
  const perWeekSubject = new Map<string, { monday: Date; subject: string; count: number }>();
  for (const b of blocks) {
    if (!b.subject.trim()) continue;
    const monday = startOfDay(b.start);
    const wd = monday.getDay();
    monday.setDate(monday.getDate() - (wd === 0 ? 6 : wd - 1));
    const key = `${monday.toISOString()}|${normalizedSubject(b.subject)}`;
    const entry = perWeekSubject.get(key) ?? { monday, subject: b.subject.trim(), count: 0 };
    entry.count++;
    perWeekSubject.set(key, entry);
  }
  const overloadedWeeks = [...perWeekSubject.values()]
    .filter((e) => e.count >= MAX_SUBJECT_SESSIONS_PER_WEEK)
    .sort((a, b) => a.monday.getTime() - b.monday.getTime());

  // Pro Fach nur eine Meldung (statt eine pro Fach × Woche)
  const bySubject = new Map<string, { subject: string; weeks: { monday: Date; count: number }[] }>();
  for (const e of overloadedWeeks) {
    const key = normalizedSubject(e.subject);
    const entry = bySubject.get(key) ?? { subject: e.subject, weeks: [] };
    entry.weeks.push({ monday: e.monday, count: e.count });
    bySubject.set(key, entry);
  }
  const tail =
    "Abwechslung zwischen Fächern hilft beim Behalten – tausche einzelne Einheiten, wenn möglich.";
  for (const s of bySubject.values()) {
    if (s.weeks.length === 1) {
      const w = s.weeks[0];
      notes.push(
        `In der Woche vom ${fmtDay(w.monday)} steht „${s.subject}“ ${w.count}-mal auf dem Plan. ${tail}`,
      );
    } else {
      const shown = s.weeks
        .slice(0, 3)
        .map((w) => fmtDay(w.monday))
        .join(", ");
      const rest = s.weeks.length - 3;
      const maxCount = Math.max(...s.weeks.map((w) => w.count));
      notes.push(
        `„${s.subject}“ steht in ${s.weeks.length} Wochen (ab ${shown}${rest > 0 ? ` und ${rest} weiteren` : ""}) ` +
          `bis zu ${maxCount}-mal pro Woche auf dem Plan. ${tail}`,
      );
    }
  }

  return notes;
}
