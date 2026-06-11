import { Plus, Filter, Lightbulb } from "lucide-react";
import { getEventColor } from "./events";

interface CalendarSidebarProps {
  onNewEvent?: () => void;
  subjects: string[];
  eventTypes: string[];
  typeColors: Record<string, string>;
  hiddenSubjects: Set<string>;
  onToggleSubject: (subject: string) => void;
}

export function CalendarSidebar({
  onNewEvent,
  subjects,
  eventTypes,
  typeColors,
  hiddenSubjects,
  onToggleSubject,
}: CalendarSidebarProps) {
  return (
    <aside
      className="flex flex-col gap-4 h-full py-6 pr-6 pl-2 overflow-y-auto"
      style={{ minWidth: 260, width: 260 }}
    >
      {/* Neues Event Button */}
      <button
        onClick={onNewEvent}
        className="flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95 shadow-sm"
        style={{ backgroundColor: "#ef233c" }}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Neues Event
      </button>

      {/* Fächer-Filter */}
      <section
        className="rounded-2xl px-4 py-4 shadow-sm"
        style={{ backgroundColor: "#5f6a70" }}
      >
        <div className="flex items-center gap-1.5 mb-3">
          <Filter className="w-3.5 h-3.5" style={{ color: "#aeb4b8" }} />
          <span
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "#aeb4b8" }}
          >
            Fächer-Filter
          </span>
        </div>
        <ul className="flex flex-col gap-2.5">
          {subjects.map((subject) => {
            const checked = !hiddenSubjects.has(subject);
            return (
              <li key={subject}>
                <label className="flex items-center gap-2.5 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleSubject(subject)}
                    className="sr-only"
                  />
                  {/* Custom Checkbox */}
                  <span
                    className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                      checked
                        ? "bg-white border-white"
                        : "bg-transparent border-white/40"
                    }`}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 10 8"
                        className="w-2.5 h-2"
                        fill="none"
                        stroke="#5f6a70"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="1 4 3.5 7 9 1" />
                      </svg>
                    )}
                  </span>
                  <span
                    className={`text-sm transition-opacity ${
                      checked ? "text-white" : "text-white/40"
                    }`}
                  >
                    {subject}
                  </span>
                </label>
              </li>
            );
          })}
          {subjects.length === 0 && (
            <li className="text-xs leading-relaxed text-white/60">
              Fächer erscheinen hier, sobald du Events anlegst.
            </li>
          )}
        </ul>
      </section>

      {/* Event-Typen Legende */}
      <section
        className="rounded-2xl px-4 py-4 shadow-sm"
        style={{ backgroundColor: "#5f6a70" }}
      >
        <span
          className="block text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#aeb4b8" }}
        >
          Event-Typen
        </span>
        <ul className="flex flex-col gap-2.5">
          {eventTypes.map((eventType) => (
            <li key={eventType} className="flex items-center gap-2.5">
              <span
                className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${getEventColor(
                  eventType,
                  typeColors[eventType],
                )}`}
              />
              <span className="text-sm text-white/85">{eventType}</span>
            </li>
          ))}
          {eventTypes.length === 0 && (
            <li className="text-xs leading-relaxed text-white/60">
              Typen erscheinen hier, sobald du Events anlegst.
            </li>
          )}
        </ul>
      </section>

      {/* Tipp-Bereich */}
      <section
        className="rounded-2xl px-4 py-4 shadow-sm"
        style={{ backgroundColor: "#5f6a70" }}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Lightbulb className="w-3.5 h-3.5 text-amber-300" />
          <span className="text-xs font-semibold text-amber-300 uppercase tracking-wider">
            Tipp
          </span>
        </div>
        <p className="text-xs leading-relaxed" style={{ color: "#c8cfd3" }}>
          Klicke auf einen freien Zeitslot, um schnell ein neues Event zu erstellen.
        </p>
        <p className="text-xs leading-relaxed mt-1.5" style={{ color: "#c8cfd3" }}>
          Bestehende Termine lassen sich per{" "}
          <strong className="text-white/80">Drag &amp; Drop</strong> verschieben.
        </p>
      </section>
    </aside>
  );
}
