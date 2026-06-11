import { Plus, Filter, Lightbulb, Search, Star, X } from "lucide-react";
import { getEventColor } from "./events";

interface CalendarSidebarProps {
  onNewEvent?: () => void;
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  subjects: string[];
  eventTypes: string[];
  typeColors: Record<string, string>;
  hiddenSubjects: Set<string>;
  onToggleSubject: (subject: string) => void;
  showImportantOnly: boolean;
  onToggleImportantOnly: () => void;
}

export function CalendarSidebar({
  onNewEvent,
  searchQuery,
  onSearchQueryChange,
  subjects,
  eventTypes,
  typeColors,
  hiddenSubjects,
  onToggleSubject,
  showImportantOnly,
  onToggleImportantOnly,
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

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Events suchen"
          aria-label="Kalender durchsuchen"
          className="w-full rounded-xl border border-gray-200 bg-white py-2.5 pl-9 pr-9 text-sm text-gray-800 shadow-sm outline-none transition-colors placeholder:text-gray-400 focus:border-brand-red focus:ring-2 focus:ring-brand-red/20"
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchQueryChange("")}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Suche löschen"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

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
        <button
          type="button"
          role="switch"
          aria-checked={showImportantOnly}
          onClick={onToggleImportantOnly}
          className={`mb-3 flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${
            showImportantOnly
              ? "border-amber-300/80 bg-amber-300/20"
              : "border-amber-200/25 bg-black/10 hover:bg-amber-300/10"
          }`}
        >
          <span className="flex items-center gap-2 text-sm font-medium text-white">
            <Star
              className="h-4 w-4 text-amber-300"
              fill={showImportantOnly ? "currentColor" : "none"}
            />
            Nur markierte Termine
          </span>
          <span
            className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
              showImportantOnly ? "bg-amber-400" : "bg-white/25"
            }`}
          >
            <span
              className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                showImportantOnly ? "translate-x-[18px]" : "translate-x-0.5"
              }`}
            />
          </span>
        </button>
        <div className="mb-3 h-px bg-white/15" />
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
                    className={`flex h-4 w-4 flex-shrink-0 items-center justify-center rounded border-2 transition-colors group-hover:border-white/80 ${
                      checked
                        ? "border-white bg-[#ffffff] shadow-sm"
                        : "border-white/45 bg-black/10"
                    }`}
                  >
                    {checked && (
                      <svg
                        viewBox="0 0 10 8"
                        className="w-2.5 h-2"
                        fill="none"
                        stroke="#4b565c"
                        strokeWidth="2.25"
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
