import { isImportantType, type CalEvent } from "@/components/calendar/events";

export type IcsComponent = {
  type?: string;
  uid?: string;
  summary?: string;
  start?: Date | string;
  end?: Date | string;
  location?: string;
  datetype?: string; // "date" für ganztägige Events
};

/**
 * Wandelt das von `node-ical` zurückgegebene Objekt in CalEvent[] um.
 * Ignoriert Nicht-VEVENT-Einträge (z. B. VTIMEZONE) und unvollständige Events.
 */
export function mapIcsToCalEvents(
  components: Record<string, IcsComponent>,
  options: { color?: string; source?: CalEvent["source"] } = {}
): CalEvent[] {
  const color = options.color ?? "bg-slate-500";
  const source = options.source ?? "dhbw";
  const events: CalEvent[] = [];

  for (const key of Object.keys(components)) {
    const c = components[key];
    if (!c || c.type !== "VEVENT") continue;
    if (!c.start || !c.end) continue;

    const start = c.start instanceof Date ? c.start : new Date(c.start);
    const end = c.end instanceof Date ? c.end : new Date(c.end);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) continue;

    // Ganztägig nur, wenn ICS es explizit so kennzeichnet (DTSTART;VALUE=DATE).
    // node-ical setzt dann `datetype: "date"`. KEINE Heuristik nach Dauer,
    // sonst werden Vorlesungen versehentlich in die All-Day-Leiste verschoben.
    const allDay = c.datetype === "date";

    const title = (c.summary ?? "").trim() || "(ohne Titel)";
    // Klausuren/Prüfungen im Stundenplan hervorheben (gleiche Heuristik wie
    // bei lokalen Terminen, siehe isImportantType).
    const isExam = isImportantType(title);

    events.push({
      id: c.uid ?? key,
      title,
      start,
      end,
      color: isExam ? "bg-brand-red" : color,
      source,
      readOnly: true,
      location: c.location?.trim() || undefined,
      allDay,
      important: isExam || undefined,
    });
  }

  return events;
}
