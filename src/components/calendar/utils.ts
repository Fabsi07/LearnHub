// Hilfsfunktionen für den Kalender (rein, ohne externe Libs)

export const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
export const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember"
];

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function endOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/** Liefert den Montag der Woche, in der `date` liegt. */
export function startOfWeek(date: Date): Date {
  const d = new Date(date);
  const day = d.getDay(); // 0 = So, 1 = Mo, ...
  const diff = (day === 0 ? -6 : 1) - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Liefert ein 6×7 Raster (42 Tage) mit Vor-/Folge-Monatstagen, beginnend Montag. */
export function getMonthGrid(date: Date): Date[] {
  const first = startOfMonth(date);
  const gridStart = startOfWeek(first);
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    days.push(d);
  }
  return days;
}

/** Liefert die 7 Tage einer Woche, beginnend Montag. */
export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

export function formatMonthYear(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatDay(date: Date): string {
  const weekday = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"][date.getDay()];
  return `${weekday}, ${date.getDate()}. ${MONTHS[date.getMonth()]} ${date.getFullYear()}`;
}

export function formatWeekRange(date: Date): string {
  const start = startOfWeek(date);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const sd = start.getDate();
  const ed = end.getDate();
  const sm = MONTHS[start.getMonth()].slice(0, 3);
  const em = MONTHS[end.getMonth()].slice(0, 3);
  if (start.getMonth() === end.getMonth()) {
    return `${sd}. – ${ed}. ${em} ${end.getFullYear()}`;
  }
  return `${sd}. ${sm} – ${ed}. ${em} ${end.getFullYear()}`;
}
