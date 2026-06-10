"use client";

import { useEffect, useState } from "react";
import { MapPin, Pencil, Trash2, X } from "lucide-react";
import {
  CalEvent,
  EVENT_TYPES,
  RepeatRule,
  SUBJECTS,
  overlapsAnyDhbwEvent,
} from "./events";

interface EventDetailModalProps {
  event: CalEvent | null;
  onClose: () => void;
  onSave: (updated: CalEvent) => void;
  onDelete: (id: string) => void;
  blockedEvents?: CalEvent[];
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
  blockedEvents = [],
}: EventDetailModalProps) {
  const [editMode, setEditMode] = useState(false);

  // Edit-Felder
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("Lernsession");
  const [subject, setSubject] = useState<string>(SUBJECTS[0].name);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [repeat, setRepeat] = useState<RepeatRule>("none");
  const [notes, setNotes] = useState("");
  const [conflictError, setConflictError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Felder beim Öffnen befüllen
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setType(event.type ?? "Lernsession");
      setSubject(event.subject ?? SUBJECTS[0].name);
      setStart(toLocalInputValue(event.start));
      setEnd(toLocalInputValue(event.end));
      setRepeat(event.repeat ?? "none");
      setNotes(event.notes ?? "");
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
    if (!title.trim()) return;
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return;
    if (endDate.getTime() <= startDate.getTime()) return;

    if (overlapsAnyDhbwEvent(startDate, endDate, blockedEvents)) {
      setConflictError(
        "Dieser Zeitraum überschneidet sich mit einer DHBW-Vorlesung. Bitte wähle einen anderen Zeitraum.",
      );
      return;
    }

    const typeColor =
      EVENT_TYPES.find((t) => t.name === type)?.color ??
      SUBJECTS.find((s) => s.name === subject)?.color ??
      "bg-brand-red";

    onSave({
      ...event,
      id: event!.id,
      title: title.trim(),
      type,
      subject,
      start: startDate,
      end: endDate,
      repeat,
      notes: notes.trim() || undefined,
      color: typeColor,
    });
    onClose();
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
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200"
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
            </div>

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
              <label htmlFor="ed-title" className="text-xs font-semibold text-gray-700">Titel</label>
              <input
                id="ed-title"
                type="text"
                required
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="ed-type" className="text-xs font-semibold text-gray-700">Typ</label>
                <input
                  id="ed-type"
                  type="text"
                  list="ed-type-list"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  placeholder="z. B. Sport, Lernsession …"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
                />
                <datalist id="ed-type-list">
                  {EVENT_TYPES.map((t) => (
                    <option key={t.name} value={t.name} />
                  ))}
                </datalist>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="ed-subject" className="text-xs font-semibold text-gray-700">Fach</label>
                <input
                  id="ed-subject"
                  type="text"
                  list="ed-subject-list"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="z. B. Sport, Mathematik …"
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red bg-white"
                />
                <datalist id="ed-subject-list">
                  {SUBJECTS.map((s) => (
                    <option key={s.name} value={s.name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="ed-start" className="text-xs font-semibold text-gray-700">Beginn</label>
                <input
                  id="ed-start"
                  type="datetime-local"
                  required
                  value={start}
                  onChange={(e) => { setStart(e.target.value); setConflictError(null); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="ed-end" className="text-xs font-semibold text-gray-700">Ende</label>
                <input
                  id="ed-end"
                  type="datetime-local"
                  required
                  value={end}
                  onChange={(e) => { setEnd(e.target.value); setConflictError(null); }}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red"
                />
              </div>
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
