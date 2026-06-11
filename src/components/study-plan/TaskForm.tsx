"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import type { TaskDTO } from "@/lib/study-plan/types";
import { fromDateInputValue, toDateInputValue } from "./planMeta";

interface TaskFormProps {
  open: boolean;
  planId: string;
  /** Bestehende Aufgabe → Bearbeiten; null → Anlegen. */
  task: TaskDTO | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red";
const selectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20";

export function TaskForm({ open, planId, task, onClose, onSaved }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [hours, setHours] = useState("1");
  const [minutes, setMinutes] = useState("0");
  const [difficulty, setDifficulty] = useState("3");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(task?.title ?? "");
    setDueDate(task ? toDateInputValue(task.dueDate) : "");
    const est = task?.estimatedMinutes ?? 60;
    setHours(String(Math.floor(est / 60)));
    setMinutes(String(est % 60));
    setDifficulty(task?.difficulty ? String(task.difficulty) : "3");
    setDescription(task?.description ?? "");
    setError(null);
    setSaving(false);
  }, [open, task]);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !dueDate) {
      setError("Bitte Titel und Fälligkeitsdatum ausfüllen.");
      return;
    }

    const estimatedMinutes = Number(hours || 0) * 60 + Number(minutes || 0);
    if (estimatedMinutes <= 0) {
      setError("Der geschätzte Aufwand muss größer als 0 sein.");
      return;
    }

    const body = {
      title: title.trim(),
      dueDate: fromDateInputValue(dueDate).toISOString(),
      estimatedMinutes,
      difficulty: Number(difficulty),
      description: description.trim() || null,
    };

    setSaving(true);
    try {
      const url = task
        ? `/api/study-plan/${planId}/tasks/${task.id}`
        : `/api/study-plan/${planId}/tasks`;
      const res = await fetch(url, {
        method: task ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { task?: TaskDTO; error?: string }
        | null;
      if (!res.ok || !data?.task) {
        throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-form-title"
        className="w-full max-w-md rounded-2xl bg-white shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 id="task-form-title" className="text-lg font-bold text-gray-900">
            {task ? "Aufgabe bearbeiten" : "Neue Aufgabe"}
          </h3>
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
            <label htmlFor="task-title" className="text-xs font-semibold text-gray-700">
              Titel
            </label>
            <input
              id="task-title"
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Übungsblatt 3 lösen"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="task-due" className="text-xs font-semibold text-gray-700">
                Fällig am
              </label>
              <input
                id="task-due"
                type="date"
                required
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="task-difficulty" className="text-xs font-semibold text-gray-700">
                Schwierigkeit
              </label>
              <select
                id="task-difficulty"
                className={selectClass}
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="1">1 – Leicht</option>
                <option value="2">2 – Eher leicht</option>
                <option value="3">3 – Mittel</option>
                <option value="4">4 – Schwer</option>
                <option value="5">5 – Sehr schwer</option>
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-xs font-semibold text-gray-700">Geschätzter Aufwand</span>
            <div className="grid grid-cols-2 gap-3">
              <div className="relative">
                <input
                  id="task-hours"
                  type="number"
                  min={0}
                  max={99}
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  aria-label="Stunden"
                  className={`${inputClass} w-full pr-12`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  Std.
                </span>
              </div>
              <div className="relative">
                <input
                  id="task-minutes"
                  type="number"
                  min={0}
                  max={59}
                  step={5}
                  value={minutes}
                  onChange={(e) => setMinutes(e.target.value)}
                  aria-label="Minuten"
                  className={`${inputClass} w-full pr-12`}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                  Min.
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="task-description" className="text-xs font-semibold text-gray-700">
              Beschreibung <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="task-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Details zur Aufgabe…"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
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
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#ef233c" }}
              >
                {saving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
