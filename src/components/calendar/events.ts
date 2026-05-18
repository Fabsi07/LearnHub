// Event-Typen und Helfer für den Kalender

export type EventSource = "local" | "dhbw";

export type EventType = "Lernsession" | "Klausur" | "Deadline" | "Pause";
export type RepeatRule = "none" | "daily" | "weekly";

export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string; // tailwind bg classes, z.B. "bg-brand-red"
  source?: EventSource;
  readOnly?: boolean;
  location?: string;
  allDay?: boolean;
  type?: EventType;
  subject?: string;
  notes?: string;
  repeat?: RepeatRule;
};

// Gemeinsame Stammdaten für Sidebar + Event-Modal
export const SUBJECTS: { name: string; color: string }[] = [
  { name: "Mathematik", color: "bg-brand-red" },
  { name: "Englisch", color: "bg-blue-500" },
  { name: "Geschichte", color: "bg-amber-500" },
  { name: "Biologie", color: "bg-emerald-500" },
  { name: "Informatik", color: "bg-purple-500" },
  { name: "Spanisch", color: "bg-orange-400" },
];

export const EVENT_TYPES: { name: EventType; color: string }[] = [
  { name: "Lernsession", color: "bg-blue-500" },
  { name: "Deadline", color: "bg-amber-500" },
  { name: "Pause", color: "bg-emerald-500" },
];

// Layout-Konstanten (müssen mit den Views übereinstimmen)
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21; // exclusive Ende → 14 Stunden sichtbar
export const HOUR_HEIGHT = 64; // px (= h-16)
export const SNAP_MIN = 15; // Snap-Raster in Minuten
export const MIN_EVENT_MIN = 30; // Mindestdauer eines Termins in Minuten


/** True, wenn ein Event ganz oder teilweise an diesem Tag liegt. */
export function eventOnDay(ev: CalEvent, day: Date): boolean {
  return (
    ev.start.getFullYear() === day.getFullYear() &&
    ev.start.getMonth() === day.getMonth() &&
    ev.start.getDate() === day.getDate()
  );
}

/**
 * True, wenn ein Event (typischerweise ganztägig / mehrtägig) den Tag
 * überlappt. DTEND in ICS ist bei All-Day-Events exklusiv → wir prüfen
 * `start <= dayEnd && end > dayStart`.
 */
export function eventOverlapsDay(ev: CalEvent, day: Date): boolean {
  const dayStart = new Date(day);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(day);
  dayEnd.setHours(23, 59, 59, 999);
  return ev.start.getTime() <= dayEnd.getTime() && ev.end.getTime() > dayStart.getTime();
}

/** Minuten ab DAY_START_HOUR (kann negativ / >range sein, Caller clampt). */
export function minutesFromDayStart(date: Date): number {
  return (date.getHours() - DAY_START_HOUR) * 60 + date.getMinutes();
}

/** px-Position (top) eines Datums innerhalb der Stunden-Spalte. */
export function dateToTop(date: Date): number {
  return (minutesFromDayStart(date) / 60) * HOUR_HEIGHT;
}

/** px-Höhe für eine Dauer in Minuten. */
export function durationToHeight(startMs: number, endMs: number): number {
  const minutes = (endMs - startMs) / 60000;
  return (minutes / 60) * HOUR_HEIGHT;
}

/** Rundet eine Minutenzahl auf SNAP_MIN. */
export function snapMinutes(min: number): number {
  return Math.round(min / SNAP_MIN) * SNAP_MIN;
}

/** hh:mm Zeitformat. */
export function formatTime(d: Date): string {
  const h = d.getHours().toString().padStart(2, "0");
  const m = d.getMinutes().toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Spalten-Layout für Events innerhalb eines Tages.
 *
 * Greedy column packing: Sortiere nach Startzeit; bilde Cluster aus transitiv
 * überlappenden Events; jedes Event bekommt die niedrigste freie Spalte
 * innerhalb seines Clusters. Am Ende kennt jedes Event `column` und `columns`
 * (Gesamtanzahl Spalten im Cluster) – damit kann ein Block in der Tages-Spalte
 * horizontal nebeneinander gerendert werden, statt sich zu überlagern.
 */
export type EventLayout = {
  event: CalEvent;
  column: number;
  columns: number;
};

export function layoutDayEvents(events: CalEvent[]): EventLayout[] {
  const sorted = [...events].sort((a, b) => {
    const d = a.start.getTime() - b.start.getTime();
    return d !== 0 ? d : a.end.getTime() - b.end.getTime();
  });

  const result: EventLayout[] = [];
  let cluster: EventLayout[] = [];
  let clusterEnd = 0;

  function flushCluster() {
    const cols = cluster.reduce((m, it) => Math.max(m, it.column + 1), 0);
    cluster.forEach((it) => {
      it.columns = cols;
    });
    result.push(...cluster);
    cluster = [];
    clusterEnd = 0;
  }

  for (const ev of sorted) {
    // Neuer Cluster, wenn dieses Event nach dem bisherigen Cluster-Ende beginnt
    if (cluster.length > 0 && ev.start.getTime() >= clusterEnd) {
      flushCluster();
    }
    // Belegte Spalten unter den noch aktiven (überlappenden) Items im Cluster
    const used = new Set(
      cluster
        .filter((it) => it.event.end.getTime() > ev.start.getTime())
        .map((it) => it.column)
    );
    let col = 0;
    while (used.has(col)) col++;
    cluster.push({ event: ev, column: col, columns: 1 });
    clusterEnd = Math.max(clusterEnd, ev.end.getTime());
  }
  flushCluster();
  return result;
}

/**
 * Expandiert wiederkehrende Events (daily/weekly) zu einzelnen Instanzen
 * im Zeitraum [rangeStart, rangeEnd]. Nicht wiederkehrende Events werden
 * unverändert durchgereicht. Erzeugte Instanzen bekommen eine zusammengesetzte
 * ID (`${id}__YYYY-MM-DD`) und sind read-only, damit einzelne Instanzen
 * nicht ungewollt die ganze Serie verschieben.
 */
export function expandRecurring(
  events: CalEvent[],
  rangeStart: Date,
  rangeEnd: Date,
): CalEvent[] {
  const out: CalEvent[] = [];

  function addDays(d: Date, n: number): Date {
    const r = new Date(d);
    r.setDate(r.getDate() + n);
    return r;
  }

  function dateKey(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  for (const ev of events) {
    if (!ev.repeat || ev.repeat === "none") {
      out.push(ev);
      continue;
    }
    const stepDays = ev.repeat === "daily" ? 1 : ev.repeat === "weekly" ? 7 : 0;
    if (!stepDays) {
      out.push(ev);
      continue;
    }

    const durMs = ev.end.getTime() - ev.start.getTime();

    // Schritte zwischen Originalstart und rangeStart (aufgerundet aufs Raster)
    const oneDay = 24 * 60 * 60 * 1000;
    const evStartDay = new Date(ev.start);
    evStartDay.setHours(0, 0, 0, 0);
    const rangeStartDay = new Date(rangeStart);
    rangeStartDay.setHours(0, 0, 0, 0);
    let diffDays = Math.round(
      (rangeStartDay.getTime() - evStartDay.getTime()) / oneDay,
    );
    if (diffDays < 0) diffDays = 0;
    diffDays = Math.ceil(diffDays / stepDays) * stepDays;

    let occStart = addDays(ev.start, diffDays);
    let safety = 0;
    while (occStart.getTime() <= rangeEnd.getTime() && safety < 500) {
      const occEnd = new Date(occStart.getTime() + durMs);
      const isOriginal = occStart.getTime() === ev.start.getTime();
      out.push({
        ...ev,
        id: isOriginal ? ev.id : `${ev.id}__${dateKey(occStart)}`,
        start: occStart,
        end: occEnd,
        readOnly: isOriginal ? ev.readOnly : true,
      });
      occStart = addDays(occStart, stepDays);
      safety++;
    }
  }
  return out;
}
