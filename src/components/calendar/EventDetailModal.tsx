"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  CircleCheckBig,
  MapPin,
  Pencil,
  Star,
  Trash2,
  X,
} from "lucide-react";
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

interface EventDetailModalProps {
  event: CalEvent | null;
  onClose: () => void;
  onSave: (updated: CalEvent) => void;
  onDelete: (id: string) => void;
  /** Abhaken einer Lernsession (Events mit verknüpfter Lernplan-Aufgabe). */
  onToggleTaskCompleted?: (event: CalEvent, completed: boolean) => void;
  blockedEvents?: CalEvent[];
  typeOptions: string[];
  typeColors: Record<string, string>;
  subjectOptions: string[];
}

function toLocalInputValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  const weekdays = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  return `${weekdays[d.getDay()]}, ${d.getDate()}. ${months[d.getMonth()]} ${d.getFullYear()} · ${pad(d.getHours())}:${pad(d.getMinutes())} Uhr`;
}

function formatDuration(start: Date, end: Date): string {
  const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
  if (minutes < 60) return `${minutes} Min.`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} Std.` : `${h} Std. ${m} Min.`;
}

export function EventDetailModal({
  event,
  onClose,
  onSave,
  onDelete,
  onToggleTaskCompleted,
  blockedEvents = [],
  typeOptions,
  typeColors,
  subjectOptions,
}: EventDetailModalProps) {
  const [editMode, setEditMode] = useState(false);

  // Edit-Felder
  const [title, setTitle] = useState("");
  const [type, setType] = useState("");
  const [typeColor, setTypeColor] = useState<string>(
    TYPE_COLOR_OPTIONS[0].className,
  );
  const [subject, setSubject] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [allDay, setAllDay] = useState(false);
  const [important, setImportant] = useState(false);
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [repeat, setRepeat] = useState<RepeatRule>("none");
  const [notes, setNotes] = useState("");
  const [tasks, setTasks] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Felder beim Öffnen befüllen
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setType(event.type ?? "");
      setTypeColor(event.color || TYPE_COLOR_OPTIONS[0].className);
      setSubject(event.subject ?? "");
      setStart(toLocalInputValue(event.start));
      setEnd(toLocalInputValue(event.end));
      setAllDay(event.allDay ?? false);
      setImportant(event.important ?? false);
      setActivePicker(null);
      setRepeat(event.repeat ?? "none");
      setNotes(event.notes ?? "");
      setTasks(event.tasks ?? "");
      setConflictError(null);
      setEditMode(false);
      setConfirmDelete(false);
    }
  }, [event]);

  // ESC schließt Modal
  useEffect(() => {
    if (!event) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (editMode) setEditMode(false);
        else onClose();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [event, editMode, onClose]);

  if (!event) return null;

  const isReadOnly = !!event.readOnly;

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmedType = type.trim();
    const trimmedSubject = subject.trim();
    if (!title.trim() || !trimmedType || !trimmedSubject) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
    if (endDate.getTime() <= startDate.getTime()) return;

    if (!allDay && !isAllowedTimedRange(startDate, endDate)) {
      setConflictError(
        "Termine müssen zwischen 07:00 und 00:00 Uhr liegen. Wähle „Ganztägig“ für Termine ohne Uhrzeit.",
      );
      return;
    }

    if (!allDay && overlapsAnyDhbwEvent(startDate, endDate, blockedEvents)) {
      setConflictError(
        "Dieser Zeitraum überschneidet sich mit einer DHBW-Vorlesung. Bitte wähle einen anderen Zeitraum.",
      );
      return;
    }

    onSave({
      ...event,
      id: event!.id,
      title: title.trim(),
      type: trimmedType,
      subject: trimmedSubject,
      start: startDate,
      end: endDate,
      allDay,
      important,
      repeat,
      notes: notes.trim() || (event!.notes ? "" : undefined),
      tasks: tasks.trim() || (event!.tasks ? "" : undefined),
      color: getEventColor(trimmedType, typeColor),
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

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    onDelete(event!.id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="event-detail-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2 min-w-0">
            {/* Farbpunkt */}
            <span className={`inline-block shrink-0 h-3 w-3 rounded-full ${event.color}`} />
            <h3
              id="event-detail-title"
              className="text-lg font-bold text-gray-900 truncate"
            >
              {editMode ? "Termin bearbeiten" : event.title}
            </h3>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {!isReadOnly && !editMode && (
              <button
                type="button"
                onClick={() => setEditMode(true)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Bearbeiten"
              >
                <Pencil className="w-4 h-4 text-gray-500" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Schließen"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Body */}
        {!editMode ? (
          /* ── Read-Only Detailansicht ── */
          <div className="px-5 py-4 flex flex-col gap-3">
            {/* Typ / Quelle */}
            <div className="flex items-center gap-2 flex-wrap">
              {event.type && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700">
                  {event.type}
                </span>
              )}
              {event.subject && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700">
                  {event.subject}
                </span>
              )}
              {event.source === "dhbw" && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-50 text-blue-700">
                  DHBW
                </span>
              )}
              {event.repeat && event.repeat !== "none" && (
                <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold bg-gray-100 text-gray-700">
                  {event.repeat === "daily" ? "Täglich" : "Wöchentlich"}
                </span>
              )}
              {event.important && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                  <Star className="h-3 w-3" fill="currentColor" />
                  Wichtig
                </span>
              )}
              {event.taskCompleted && (
                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">
                  <CircleCheckBig className="h-3 w-3" />
                  Erledigt
                </span>
              )}
            </div>

            {event.studyPlanId && (
              <Link
                href={`/study-plan/${event.studyPlanId}`}
                onClick={onClose}
                className="flex items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-left transition-colors hover:border-blue-300 hover:bg-blue-100"
              >
                <span className="flex min-w-0 items-center gap-2">
                  <BookOpen className="h-4 w-4 shrink-0 text-blue-700" />
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold uppercase tracking-wider text-blue-600">
                      Lernplan
                    </span>
                    <span className="block truncate text-sm font-bold text-blue-900">
                      {event.studyPlanTitle ?? "Zum Lernplan"}
                    </span>
                  </span>
                </span>
                <ArrowRight className="h-4 w-4 shrink-0 text-blue-700" />
              </Link>
            )}

            {/* Lernsession abhaken (Events mit verknüpfter Lernplan-Aufgabe) */}
            {event.taskId && event.studyPlanId && onToggleTaskCompleted && (
              <button
                type="button"
                role="switch"
                aria-checked={!!event.taskCompleted}
                onClick={() => onToggleTaskCompleted(event, !event.taskCompleted)}
                className={`flex items-center justify-between rounded-xl border px-3 py-2.5 text-left transition-colors ${
                  event.taskCompleted
                    ? "border-green-300 bg-green-50 text-green-700"
                    : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span className="flex items-center gap-2 text-sm font-semibold">
                  <CircleCheckBig className="h-4 w-4" />
                  {event.taskCompleted
                    ? "Lernsession erledigt"
                    : "Lernsession abhaken"}
                </span>
                <span className="text-xs font-medium">
                  {event.taskCompleted ? "Als offen markieren" : "Als erledigt markieren"}
                </span>
              </button>
            )}

            {/* Zeit */}
            <div className="rounded-xl bg-gray-50 px-4 py-3 flex flex-col gap-1">
              {event.allDay ? (
                <p className="text-sm font-medium text-gray-900">Ganztägig</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-gray-900">{formatDateTime(event.start)}</p>
                  <p className="text-xs text-gray-500">
                    bis {`${event.end.getHours().toString().padStart(2, "0")}:${event.end.getMinutes().toString().padStart(2, "0")} Uhr`}
                    &nbsp;·&nbsp;{formatDuration(event.start, event.end)}
                  </p>
                </>
              )}
            </div>

            {/* Ort */}
            {event.location && (
              <div className="flex items-start gap-2 text-sm text-gray-700">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-gray-400" />
                <span>{event.location}</span>
              </div>
            )}

            {/* Aufgaben */}
            {event.tasks && (
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Aufgaben</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.tasks}</p>
              </div>
            )}

            {/* Notizen */}
            {event.notes && (
              <div className="rounded-xl bg-gray-50 px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1">Notiz</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{event.notes}</p>
              </div>
            )}

            {/* Footer: Löschen */}
            {!isReadOnly && (
              <div className="pt-2 border-t border-gray-100 flex justify-between items-center">
                {confirmDelete ? (
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-xs text-red-600 font-medium flex-1">Wirklich löschen?</span>
                    <button
                      type="button"
                      onClick={() => setConfirmDelete(false)}
                      className="px-3 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                    >
                      Abbrechen
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="px-3 py-1.5 text-sm font-bold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors"
                    >
                      Löschen
                    </button>
                  </div>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                      Löschen
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditMode(true)}
                      className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90"
                      style={{ backgroundColor: "#ef233c" }}
                    >
                      <Pencil className="w-4 h-4" />
                      Bearbeiten
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          /* ── Edit-Formular ── */
          <form onSubmit={handleSave} className="px-5 py-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label htmlFor="ed-title" className="text-xs font-semibold text-gray-700">
                Titel <span className="text-brand-red">*</span>
              </label>
              <input
                id="ed-title"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red ${
                  title.trim()
                    ? "border-gray-300 bg-white"
                    : "border-gray-300 bg-gray-100 text-gray-500"
                }`}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <EditableCombobox
                id="ed-type"
                label="Typ"
                value={type}
                options={typeOptions}
                onChange={handleTypeChange}
                placeholder="Typ eingeben"
              />
              <EditableCombobox
                id="ed-subject"
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
                id="ed-start"
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
                  id="ed-end"
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
              <label htmlFor="ed-notes" className="text-xs font-semibold text-gray-700">Notiz</label>
              <textarea
                id="ed-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Optionale Anmerkungen…"
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="ed-tasks" className="text-xs font-semibold text-gray-700">Aufgaben</label>
              <textarea
                id="ed-tasks"
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

            <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
              {conflictError && (
                <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
                  {conflictError}
                </p>
              )}
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  {confirmDelete ? "Wirklich?" : "Löschen"}
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditMode(false)}
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
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
