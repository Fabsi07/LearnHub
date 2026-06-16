"use client";

import { useEffect, useState } from "react";
import { CalendarPlus, X } from "lucide-react";
import {
  DAY_START_HOUR,
  isAllowedTimedRange,
  type RepeatRule,
} from "@/components/calendar/events";
import { DateTimePicker } from "@/components/calendar/DateTimePicker";
import type { TaskDTO } from "@/lib/study-plan/types";

interface TaskLearningSlotModalProps {
  open: boolean;
  planId: string;
  subject: string;
  task: TaskDTO | null;
  onClose: () => void;
  onCreated: () => void;
}

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(
    date.getHours(),
  )}:${pad(date.getMinutes())}`;
}

function defaultStartForTask(task: TaskDTO): Date {
  const dueDate = new Date(task.dueDate);
  const start = Number.isNaN(dueDate.getTime()) ? new Date() : dueDate;
  const now = new Date();
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);

  if (start.getTime() < today.getTime()) {
    start.setTime(now.getTime());
  }

  start.setHours(16, 0, 0, 0);
  if (start.getTime() <= now.getTime()) {
    start.setTime(now.getTime());
    start.setMinutes(Math.ceil(start.getMinutes() / 15) * 15, 0, 0);
    if (start.getHours() < DAY_START_HOUR) {
      start.setHours(DAY_START_HOUR, 0, 0, 0);
    }
    if (!isAllowedTimedRange(start, defaultEndForTask(start, 30))) {
      start.setDate(start.getDate() + 1);
      start.setHours(16, 0, 0, 0);
    }
  }
  return start;
}

function defaultEndForTask(start: Date, estimatedMinutes: number): Date {
  const durationMinutes = Math.max(30, Math.min(estimatedMinutes, 8 * 60));
  const end = new Date(start.getTime() + durationMinutes * 60_000);
  const dayEnd = new Date(start);
  dayEnd.setDate(dayEnd.getDate() + 1);
  dayEnd.setHours(0, 0, 0, 0);
  return end.getTime() <= dayEnd.getTime() ? end : dayEnd;
}

function taskSlotText(task: TaskDTO): string {
  const lines = [task.title.trim()];
  if (task.description?.trim()) lines.push("", task.description.trim());
  return lines.join("\n");
}

export function TaskLearningSlotModal({
  open,
  planId,
  subject,
  task,
  onClose,
  onCreated,
}: TaskLearningSlotModalProps) {
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [activePicker, setActivePicker] = useState<"start" | "end" | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !task) return;
    const initialStart = defaultStartForTask(task);
    const initialEnd = defaultEndForTask(initialStart, task.estimatedMinutes);
    setStart(toLocalInputValue(initialStart));
    setEnd(toLocalInputValue(initialEnd));
    setActivePicker(null);
    setSaving(false);
    setError(null);
  }, [open, task]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape" && !saving) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, saving]);

  if (!open || !task) return null;
  const activeTask = task;

  function handleStartChange(nextStart: string) {
    setStart(nextStart);
    setError(null);
    const startDate = new Date(nextStart);
    const endDate = new Date(end);
    if (
      !Number.isNaN(startDate.getTime()) &&
      !Number.isNaN(endDate.getTime()) &&
      endDate.getTime() <= startDate.getTime()
    ) {
      setEnd(toLocalInputValue(defaultEndForTask(startDate, activeTask.estimatedMinutes)));
    }
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    const startDate = new Date(start);
    const endDate = new Date(end);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime()) ||
      endDate.getTime() <= startDate.getTime()
    ) {
      setError("Bitte wähle einen gültigen Zeitraum.");
      return;
    }

    if (!isAllowedTimedRange(startDate, endDate)) {
      setError("Lernslots müssen zwischen 07:00 und 00:00 Uhr liegen.");
      return;
    }

    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: `Lernslot: ${activeTask.title}`,
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          allDay: false,
          type: "Lernsession",
          subject,
          tasks: taskSlotText(activeTask),
          repeat: "none" satisfies RepeatRule,
          studyPlanId: planId,
          taskId: activeTask.id,
        }),
      });

      const data = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(data?.error ?? "Lernslot konnte nicht gespeichert werden.");
      }

      onCreated();
      onClose();
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Lernslot konnte nicht gespeichert werden.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!saving) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-learning-slot-title"
        className="max-h-[calc(100vh-2rem)] w-full max-w-md overflow-y-auto rounded-2xl border border-gray-200 bg-white shadow-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarPlus className="h-5 w-5 shrink-0 text-brand-red" />
            <h3
              id="task-learning-slot-title"
              className="truncate text-lg font-bold text-gray-900"
            >
              Lernslot erstellen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg p-1 hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Schliessen"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5 py-4">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-sm font-semibold text-gray-900">{activeTask.title}</p>
            {activeTask.description && (
              <p className="mt-1 line-clamp-2 text-xs text-gray-500">
                {activeTask.description}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <DateTimePicker
              id="task-slot-start"
              label="Beginn"
              value={start}
              open={activePicker === "start"}
              stage="start"
              onOpenChange={(nextOpen) => setActivePicker(nextOpen ? "start" : null)}
              onChange={handleStartChange}
              onComplete={() => setActivePicker("end")}
            />
            <DateTimePicker
              id="task-slot-end"
              label="Ende"
              value={end}
              open={activePicker === "end"}
              align="right"
              allowMidnight
              stage="end"
              onOpenChange={(nextOpen) => setActivePicker(nextOpen ? "end" : null)}
              onChange={(nextEnd) => {
                setEnd(nextEnd);
                setError(null);
              }}
            />
          </div>

          <div className="flex flex-col gap-2 border-t border-gray-100 pt-2">
            {error && (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-600">
                {error}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-bold text-white shadow-sm transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#ef233c" }}
              >
                <CalendarPlus className="h-4 w-4" />
                {saving ? "Wird gespeichert..." : "In Kalender eintragen"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
