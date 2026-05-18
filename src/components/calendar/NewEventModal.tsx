"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import {
  CalEvent,
  EVENT_TYPES,
  EventType,
  RepeatRule,
  SUBJECTS,
} from "./events";

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: CalEvent) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`;
}

function roundedHour(d: Date, addHours = 0): Date {
  const out = new Date(d);
  out.setMinutes(0, 0, 0);
  out.setHours(out.getHours() + addHours);
  return out;
}

export function NewEventModal({
  open,
  onClose,
  onCreate,
  defaultStart,
  defaultEnd,
}: NewEventModalProps) {
  const initialStart = defaultStart ?? roundedHour(new Date(), 1);
  const initialEnd =
    defaultEnd ??
    (() => {
      const e = new Date(initialStart);
      e.setHours(e.getHours() + 1);
      return e;
    })();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<EventType>("Lernsession");
  const [subject, setSubject] = useState<string>(SUBJECTS[0].name);
  const [start, setStart] = useState<string>(toLocalInputValue(initialStart));
  const [end, setEnd] = useState<string>(toLocalInputValue(initialEnd));
  const [repeat, setRepeat] = useState<RepeatRule>("none");
  const [notes, setNotes] = useState("");

  // Reset bei Schließen/Öffnen
  useEffect(() => {
    if (open) {
      const s = defaultStart ?? roundedHour(new Date(), 1);
      const e =
        defaultEnd ??
        (() => {
          const x = new Date(s);
          x.setHours(x.getHours() + 1);
          return x;
        })();
      setTitle("");
      setType("Lernsession");
      setSubject(SUBJECTS[0].name);
      setStart(toLocalInputValue(s));
      setEnd(toLocalInputValue(e));
      setRepeat("none");
      setNotes("");
    }
  }, [open, defaultStart, defaultEnd]);

  // ESC schließt Modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;
    if (endDate.getTime() <= startDate.getTime()) return;

    const typeColor =
      EVENT_TYPES.find((t) => t.name === type)?.color ??
      SUBJECTS.find((s) => s.name === subject)?.color ??
      "bg-brand-red";

    onCreate({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      start: startDate,
      end: endDate,
      color: typeColor,
      source: "local",
      type,
      subject,
      notes: notes.trim() || undefined,
      repeat,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 className="text-lg font-bold text-gray-900">Neues Event</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="ev-title" className="text-xs font-semibold text-gray-700">
              Titel
            </label>
            <input
              id="ev-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Klausurvorbereitung Analysis"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="ev-type" className="text-xs font-semibold text-gray-700">
                Typ
              </label>
              <select
                id="ev-type"
                value={type}
                onChange={(e) => setType(e.target.value as EventType)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
              >
                {EVENT_TYPES.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ev-subject" className="text-xs font-semibold text-gray-700">
                Fach
              </label>
              <select
                id="ev-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
              >
                {SUBJECTS.map((s) => (
                  <option key={s.name} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="ev-start" className="text-xs font-semibold text-gray-700">
                Beginn
              </label>
              <input
                id="ev-start"
                type="datetime-local"
                required
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="ev-end" className="text-xs font-semibold text-gray-700">
                Ende
              </label>
              <input
                id="ev-end"
                type="datetime-local"
                required
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="ev-notes" className="text-xs font-semibold text-gray-700">
              Notiz
            </label>
            <textarea
              id="ev-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Optionale Anmerkungen…"
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-700">Wiederholen</span>
            <div className="flex items-center gap-1 p-1 rounded-xl bg-gray-100">
              {(
                [
                  { v: "none", label: "Keine" },
                  { v: "daily", label: "Täglich" },
                  { v: "weekly", label: "Wöchentlich" },
                ] as { v: RepeatRule; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.v}
                  type="button"
                  onClick={() => setRepeat(opt.v)}
                  className={`flex-1 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors ${
                    repeat === opt.v
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#ef233c" }}
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
