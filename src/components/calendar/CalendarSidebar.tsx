"use client";

import { useState } from "react";
import { Plus, Filter, Lightbulb } from "lucide-react";

// Fächer mit festen Farben
const SUBJECTS = [
  { name: "Mathematik", color: "bg-brand-red" },
  { name: "Englisch", color: "bg-blue-500" },
  { name: "Geschichte", color: "bg-amber-500" },
  { name: "Biologie", color: "bg-emerald-500" },
  { name: "Informatik", color: "bg-purple-500" },
  { name: "Spanisch", color: "bg-orange-400" },
];

// Event-Typ-Legende
const EVENT_TYPES = [
  { name: "Lernsession", color: "bg-blue-500" },
  { name: "Klausur", color: "bg-brand-red" },
  { name: "Deadline", color: "bg-amber-500" },
  { name: "Pause", color: "bg-emerald-500" },
];

interface CalendarSidebarProps {
  onNewEvent?: () => void;
}

export function CalendarSidebar({ onNewEvent }: CalendarSidebarProps) {
  const [checked, setChecked] = useState<Record<string, boolean>>(
    Object.fromEntries(SUBJECTS.map((s) => [s.name, true]))
  );

  function toggle(name: string) {
    setChecked((prev) => ({ ...prev, [name]: !prev[name] }));
  }

  return (
    <aside
      className="flex flex-col gap-6 h-full px-4 py-5 overflow-y-auto"
      style={{ backgroundColor: "#5f6a70", minWidth: 220, width: 220 }}
    >
      {/* Neues Event Button */}
      <button
        onClick={onNewEvent}
        className="flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
        style={{ backgroundColor: "#ef233c" }}
      >
        <Plus className="w-4 h-4" strokeWidth={2.5} />
        Neues Event
      </button>

      {/* Fächer-Filter */}
      <section>
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
          {SUBJECTS.map((s) => (
            <li key={s.name}>
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={checked[s.name]}
                  onChange={() => toggle(s.name)}
                  className="sr-only"
                />
                {/* Custom Checkbox */}
                <span
                  className={`flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                    checked[s.name]
                      ? "bg-white border-white"
                      : "bg-transparent border-white/40"
                  }`}
                >
                  {checked[s.name] && (
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
                {/* Farbiger Punkt */}
                <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${s.color}`} />
                {/* Fachname */}
                <span
                  className={`text-sm transition-opacity ${
                    checked[s.name] ? "text-white" : "text-white/40"
                  }`}
                >
                  {s.name}
                </span>
              </label>
            </li>
          ))}
        </ul>
      </section>

      {/* Trennlinie */}
      <div style={{ borderTop: "1px solid #7a868c" }} />

      {/* Event-Typen Legende */}
      <section>
        <span
          className="block text-xs font-semibold uppercase tracking-wider mb-3"
          style={{ color: "#aeb4b8" }}
        >
          Event-Typen
        </span>
        <ul className="flex flex-col gap-2.5">
          {EVENT_TYPES.map((t) => (
            <li key={t.name} className="flex items-center gap-2.5">
              <span className={`flex-shrink-0 w-2.5 h-2.5 rounded-full ${t.color}`} />
              <span className="text-sm text-white/80">{t.name}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* Trennlinie */}
      <div style={{ borderTop: "1px solid #7a868c" }} />

      {/* Tipp-Bereich */}
      <section
        className="rounded-xl px-3 py-3"
        style={{ backgroundColor: "rgba(255,255,255,0.07)" }}
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
          Bestehende Termine lassen sich per <strong className="text-white/70">Drag &amp; Drop</strong> verschieben.
        </p>
      </section>
    </aside>
  );
}
