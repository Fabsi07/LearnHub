// Event-Typen, Dummy-Daten und Helfer für den Kalender

export type CalEvent = {
  id: string;
  title: string;
  start: Date;
  end: Date;
  color: string; // tailwind bg classes, z.B. "bg-brand-red"
};

// Layout-Konstanten (müssen mit den Views übereinstimmen)
export const DAY_START_HOUR = 7;
export const DAY_END_HOUR = 21; // exclusive Ende → 14 Stunden sichtbar
export const HOUR_HEIGHT = 64; // px (= h-16)
export const SNAP_MIN = 15; // Snap-Raster in Minuten

/** Erzeugt ein Datum am gegebenen Tag mit Stunde+Minute. */
function at(base: Date, h: number, m: number): Date {
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

/** Liefert ein paar Dummy-Events relativ zu „heute" für schnelles Testen. */
export function getDummyEvents(): CalEvent[] {
  const today = new Date();
  const monday = new Date(today);
  const day = monday.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  monday.setDate(monday.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const d = (offset: number) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + offset);
    return x;
  };

  return [
    {
      id: "1",
      title: "Mathe Vorlesung",
      start: at(d(0), 8, 0),
      end: at(d(0), 9, 30),
      color: "bg-brand-red",
    },
    {
      id: "2",
      title: "Lerngruppe BWL",
      start: at(d(0), 14, 0),
      end: at(d(0), 15, 30),
      color: "bg-blue-500",
    },
    {
      id: "3",
      title: "Programmieren Übung",
      start: at(d(1), 10, 0),
      end: at(d(1), 12, 0),
      color: "bg-emerald-500",
    },
    {
      id: "4",
      title: "Prüfungsvorbereitung",
      start: at(d(2), 9, 0),
      end: at(d(2), 11, 0),
      color: "bg-amber-500",
    },
    {
      id: "5",
      title: "Statistik Klausur",
      start: at(d(3), 13, 0),
      end: at(d(3), 14, 30),
      color: "bg-brand-red",
    },
    {
      id: "6",
      title: "Sprechstunde Prof.",
      start: at(d(4), 11, 0),
      end: at(d(4), 11, 45),
      color: "bg-purple-500",
    },
    {
      id: "7",
      title: "Sport",
      start: at(d(today.getDay() === 0 ? -1 : 0), 17, 0),
      end: at(d(today.getDay() === 0 ? -1 : 0), 18, 30),
      color: "bg-blue-500",
    },
  ];
}

/** True, wenn ein Event ganz oder teilweise an diesem Tag liegt. */
export function eventOnDay(ev: CalEvent, day: Date): boolean {
  return (
    ev.start.getFullYear() === day.getFullYear() &&
    ev.start.getMonth() === day.getMonth() &&
    ev.start.getDate() === day.getDate()
  );
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
