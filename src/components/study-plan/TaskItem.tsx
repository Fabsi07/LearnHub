"use client";

import { useState } from "react";
import {
  AlertTriangle,
  CalendarCheck,
  CalendarDays,
  CalendarPlus,
  Clock,
  Gauge,
  Pencil,
  Trash2,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { isOpenTaskOverdue } from "@/lib/study-plan/dueDates";
import { cn } from "@/lib/utils";
import type { TaskCalendarEventDTO, TaskDTO } from "@/lib/study-plan/types";
import { formatDate, formatMinutes } from "./planMeta";

interface TaskItemProps {
  planId: string;
  task: TaskDTO;
  onChanged: () => void;
  onEdit: (task: TaskDTO) => void;
  onCreateSlot: (task: TaskDTO) => void;
}

function formatSlotRange(slot: TaskCalendarEventDTO): string {
  const start = new Date(slot.startsAt);
  const end = new Date(slot.endsAt);
  const date = new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
  }).format(start);
  const time = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${date}, ${time.format(start)}-${time.format(end)}`;
}

export function TaskItem({
  planId,
  task,
  onChanged,
  onEdit,
  onCreateSlot,
}: TaskItemProps) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const overdue = isOpenTaskOverdue(task);

  async function toggleCompleted(checked: boolean) {
    setBusy(true);
    try {
      const res = await fetch(`/api/study-plan/${planId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: checked }),
      });
      if (res.ok) onChanged();
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/study-plan/${planId}/tasks/${task.id}`, { method: "DELETE" });
      if (res.ok) onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border px-4 py-3 transition-colors",
        task.completed && "border-gray-200 bg-gray-50 dark:border-white/10 dark:bg-white/5",
        !task.completed &&
          !overdue &&
          "border-gray-200 bg-white hover:border-gray-300 dark:border-white/10 dark:bg-card dark:hover:border-white/20",
        overdue &&
          "border-red-300 bg-red-50/70 hover:border-red-400 dark:border-red-400/70 dark:bg-red-950/45 dark:hover:border-red-300",
      )}
    >
      <div className="pt-0.5">
        <Checkbox
          checked={task.completed}
          disabled={busy}
          onCheckedChange={(checked) => void toggleCompleted(checked === true)}
          aria-label={task.completed ? "Als offen markieren" : "Als erledigt markieren"}
        />
      </div>

      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium",
            task.completed
              ? "text-gray-400 line-through dark:text-white/35"
              : overdue
                ? "text-gray-950 dark:text-white"
                : "text-gray-900 dark:text-white",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p
            className={cn(
              "mt-0.5 line-clamp-2 text-xs",
              overdue ? "text-gray-600 dark:text-red-100/80" : "text-gray-500 dark:text-white/60",
            )}
          >
            {task.description}
          </p>
        )}
        <div
          className={cn(
            "mt-1.5 flex flex-wrap items-center gap-3 text-xs",
            overdue ? "text-gray-600 dark:text-red-100/75" : "text-gray-500 dark:text-white/60",
          )}
        >
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "font-medium text-red-700 dark:text-red-200",
            )}
          >
            {overdue ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : (
              <CalendarDays className="w-3.5 h-3.5" />
            )}
            {formatDate(task.dueDate)}
            {overdue && (
              <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[11px] font-semibold text-red-700 dark:bg-red-500/20 dark:text-red-100 dark:ring-1 dark:ring-red-300/30">
                Überfällig
              </span>
            )}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatMinutes(task.estimatedMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" />
            Schwierigkeit {task.difficulty}/5
          </span>
          {task.calendarEvent ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 font-medium text-green-700 dark:bg-green-500/15 dark:text-green-100 dark:ring-1 dark:ring-green-300/25">
              <CalendarCheck className="w-3.5 h-3.5" />
              Lernslot {formatSlotRange(task.calendarEvent)}
            </span>
          ) : (
            <button
              type="button"
              onClick={() => onCreateSlot(task)}
              className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-2 py-0.5 font-medium text-gray-600 transition-colors hover:border-brand-red hover:text-brand-red dark:border-white/15 dark:bg-white/5 dark:text-white/70 dark:hover:border-brand-red dark:hover:text-red-200"
            >
              <CalendarPlus className="w-3.5 h-3.5" />
              Lernslot
            </button>
          )}
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="rounded-lg border border-gray-300 px-2 py-1 text-xs transition-colors hover:bg-gray-50 dark:border-white/15 dark:text-white/80 dark:hover:bg-white/10"
            >
              Abbrechen
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => void handleDelete()}
              className="px-2 py-1 text-xs font-bold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
            >
              Wirklich?
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 dark:text-white/45 dark:hover:bg-white/10 dark:hover:text-white"
              aria-label="Aufgabe bearbeiten"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-600 dark:text-white/45 dark:hover:bg-red-500/15 dark:hover:text-red-200"
              aria-label="Aufgabe löschen"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
