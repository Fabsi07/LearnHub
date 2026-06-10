"use client";

import { useState } from "react";
import { CalendarDays, Clock, Gauge, Pencil, Trash2 } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import type { TaskDTO } from "@/lib/study-plan/types";
import { daysUntil, formatDate, formatMinutes } from "./planMeta";

interface TaskItemProps {
  planId: string;
  task: TaskDTO;
  onChanged: () => void;
  onEdit: (task: TaskDTO) => void;
}

export function TaskItem({ planId, task, onChanged, onEdit }: TaskItemProps) {
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const overdue = !task.completed && daysUntil(task.dueDate) < 0;

  async function toggleCompleted(checked: boolean) {
    setBusy(true);
    try {
      await fetch(`/api/study-plan/${planId}/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: checked }),
      });
      onChanged();
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
      await fetch(`/api/study-plan/${planId}/tasks/${task.id}`, { method: "DELETE" });
      onChanged();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border border-gray-200 px-4 py-3 transition-colors",
        task.completed ? "bg-gray-50" : "bg-white hover:border-gray-300",
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
            task.completed ? "text-gray-400 line-through" : "text-gray-900",
          )}
        >
          {task.title}
        </p>
        {task.description && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{task.description}</p>
        )}
        <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500 flex-wrap">
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "text-red-600 font-medium",
            )}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            {formatDate(task.dueDate)}
            {overdue && " · überfällig"}
          </span>
          <span className="inline-flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {formatMinutes(task.estimatedMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Gauge className="w-3.5 h-3.5" />
            Schwierigkeit {task.difficulty}/5
          </span>
        </div>
      </div>

      {/* Aktionen */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {confirmDelete ? (
          <>
            <button
              type="button"
              onClick={() => setConfirmDelete(false)}
              className="px-2 py-1 text-xs rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
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
              className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
              aria-label="Aufgabe bearbeiten"
            >
              <Pencil className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => void handleDelete()}
              className="p-1.5 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
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
