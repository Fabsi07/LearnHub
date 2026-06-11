"use client";

import { useEffect, useState } from "react";
import { CalendarDays, Star, X } from "lucide-react";
import {
  CalEvent,
  RepeatRule,
  DAY_START_HOUR,
  TYPE_COLOR_OPTIONS,
  endOneHourLaterWithinDay,
  getAllDayRange,
  getEventColor,
  isImportantType,
  isAllowedTimedRange,
  overlapsAnyDhbwEvent,
} from "./events";
import { DateTimePicker } from "./DateTimePicker";
import { EditableCombobox } from "./EditableCombobox";
import { TypeColorPicker } from "./TypeColorPicker";

interface NewEventModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (event: CalEvent) => void;
  defaultStart?: Date;
  defaultEnd?: Date;
  typeOptions: string[];
  typeColors: Record<string, string>;
  subjectOptions: string[];
  /** DHBW-Events, in die kein eigener Termin gelegt werden darf. */
  blockedEvents?: CalEvent[];
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
  if (out.getHours() < DAY_START_HOUR) {
    out.setHours(DAY_START_HOUR, 0, 0, 0);
  }
  return out;
}

export function NewEventModal({
  open,
  onClose,
  onCreate,
  defaultStart,
  defaultEnd,
  typeOptions,
  typeColors,
  subjectOptions,
  blockedEvents = [],
}: NewEventModalProps) {
  const initialStart = defaultStart ?? roundedHour(new Date(), 1);
  const initialEnd =
    defaultEnd ??
    (() => {
      return endOneHourLaterWithinDay(initialStart);
    })();

  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [typeColor, setTypeColor] = useState<string>(
    TYPE_COLOR_OPTIONS[0].className,
  );
  const [subject, setSubject] = useState("");
  const [start, setStart] = useState<string>(toLocalInputValue(initialStart));
  const [end, setEnd] = useState<string>(toLocalInputValue(initialEnd));
  const [allDay, setAllDay] = useState(false);
  const [important, setImportant] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [repeat, setRepeat] = useState<RepeatRule>("none");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);

  // Reset bei Schließen/Öffnen
  useEffect(() => {
    if (open) {
      const s = defaultStart ?? roundedHour(new Date(), 1);
      const e =
        defaultEnd ??
        (() => {
          return endOneHourLaterWithinDay(s);
        })();
      setTitle("");
      setType("");
      setTypeColor(TYPE_COLOR_OPTIONS[0].className);
      setSubject("");
      setStart(toLocalInputValue(s));
      setEnd(toLocalInputValue(e));
      setAllDay(false);
      setImportant(false);
      setActivePicker(null);
      setRepeat("none");
      setNotes("");
      setTasks("");
      setConflictError(null);
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
    const trimmedType = type.trim();
    const trimmedSubject = subject.trim();
    if (!title.trim() || !trimmedType || !trimmedSubject) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) return;
    if (endDate.getTime() <= startDate.getTime()) return;

    if (!allDay && !isAllowedTimedRange(startDate, endDate)) {
      setConflictError(
        "Termine müssen zwischen 07:00 und 00:00 Uhr liegen. Wähle „Ganztägig“ für Termine ohne Uhrzeit.",
      );
      return;
    }

    // DHBW-Konfliktprüfung
    if (!allDay && overlapsAnyDhbwEvent(startDate, endDate, blockedEvents)) {
      setConflictError(
        "Dieser Zeitraum überschneidet sich mit einer DHBW-Vorlesung. Bitte wähle einen anderen Zeitraum.",
      );
      return;
    }

    onCreate({
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      title: title.trim(),
      start: startDate,
      end: endDate,
      color: getEventColor(trimmedType, typeColor),
      source: "local",
      allDay,
      important,
      type: trimmedType,
      subject: trimmedSubject,
      notes: notes.trim() || undefined,
      tasks: tasks.trim() || undefined,
      repeat,
    });
    onClose();
  }

  function handleStartChange(nextStart: string) {
    setStart(nextStart);
    setConflictError(null);
    const startDate = new Date(nextStart);
    const endDate = new Date(end);
    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      !isAllowedTimedRange(startDate, endDate)
    ) {
      setEnd(toLocalInputValue(endOneHourLaterWithinDay(startDate)));
    }
  }

  function handleTypeChange(nextType: string) {
    setType(nextType);
    if (isImportantType(nextType)) {
      setImportant(true);
    }
    const existingType = Object.keys(typeColors).find(
      (name) =>
        name.toLocaleLowerCase("de-DE") ===
        nextType.trim().toLocaleLowerCase("de-DE"),
    );
    if (existingType) {
      setTypeColor(typeColors[existingType]);
    }
  }

  function handleAllDayChange(nextAllDay: boolean) {
    setAllDay(nextAllDay);
    setActivePicker(null);
    setConflictError(null);
    const selectedDate = new Date(start);
    if (nextAllDay) {
      const range = getAllDayRange(selectedDate);
      setStart(toLocalInputValue(range.start));
      setEnd(toLocalInputValue(range.end));
      return;
    }

    selectedDate.setHours(DAY_START_HOUR, 0, 0, 0);
    setStart(toLocalInputValue(selectedDate));
    setEnd(toLocalInputValue(endOneHourLaterWithinDay(selectedDate)));
  }

  function handleAllDayDateChange(nextStart: string) {
    const range = getAllDayRange(new Date(nextStart));
    setStart(toLocalInputValue(range.start));
    setEnd(toLocalInputValue(range.end));
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-event-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 id="new-event-title" className="text-lg font-bold text-gray-900">Neues Event</h3>
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
              Titel <span className="text-brand-red">*</span>
            </label>
            <input
              id="ev-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Klausurvorbereitung Analysis"
              className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red ${
                title.trim()
                  ? "border-gray-300 bg-white"
                  : "border-gray-300 bg-gray-100 text-gray-500"
              }`}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditableCombobox
              id="ev-type"
              label="Typ"
              value={type}
              options={typeOptions}
              onChange={handleTypeChange}
              placeholder="Typ eingeben"
            />
            <EditableCombobox
              id="ev-subject"
              label="Fach"
              value={subject}
              options={subjectOptions}
              onChange={setSubject}
              placeholder="Fach eingeben"
            />
          </div>

          <TypeColorPicker value={typeColor} onChange={setTypeColor} />

          <button
            type="button"
            role="switch"
            aria-checked={allDay}
            onClick={() => handleAllDayChange(!allDay)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
              allDay
                ? "border-brand-red bg-red-50 text-brand-red"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <CalendarDays className="h-4 w-4" />
              Ganztägig
            </span>
            <span
              className={`relative h-5 w-9 rounded-full transition-colors ${
                allDay ? "bg-brand-red" : "bg-gray-300"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  allDay ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            role="switch"
            aria-checked={important}
            onClick={() => setImportant((current) => !current)}
            className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
              important
                ? "border-amber-400 bg-amber-50 text-amber-700"
                : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            }`}
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Star
                className="h-4 w-4"
                fill={important ? "currentColor" : "none"}
              />
              Wichtiger Termin
            </span>
            <span className="text-xs font-medium">
              {important ? "Markiert" : "Optional"}
            </span>
          </button>

          <div className={allDay ? "" : "grid grid-cols-2 gap-3"}>
            <DateTimePicker
              id="ev-start"
              label={allDay ? "Datum" : "Beginn"}
              value={start}
              open={activePicker === "start"}
              dateOnly={allDay}
              stage={allDay ? undefined : "start"}
              onOpenChange={(nextOpen) => setActivePicker(nextOpen ? "start" : null)}
              onChange={allDay ? handleAllDayDateChange : handleStartChange}
              onComplete={allDay ? undefined : () => setActivePicker("end")}
            />
            {!allDay && (
              <DateTimePicker
                id="ev-end"
                label="Ende"
                value={end}
                open={activePicker === "end"}
                align="right"
                allowMidnight
                stage="end"
                onOpenChange={(nextOpen) => setActivePicker(nextOpen ? "end" : null)}
                onChange={(nextEnd) => {
                  setEnd(nextEnd);
                  setConflictError(null);
                }}
              />
            )}
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
            <label htmlFor="ev-tasks" className="text-xs font-semibold text-gray-700">
              Aufgaben
            </label>
            <textarea
              id="ev-tasks"
              value={tasks}
              onChange={(e) => setTasks(e.target.value)}
              rows={3}
              placeholder="Was möchtest du in diesem Termin erledigen? Eine Aufgabe pro Zeile…"
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
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {conflictError && (
              <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {conflictError}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
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
          </div>
        </form>
      </div>
    </div>
  );
}
