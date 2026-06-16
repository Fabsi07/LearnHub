"use client";

import { useState } from "react";
import { CircleCheckBig, Plus } from "lucide-react";
import type { TaskDTO } from "@/lib/study-plan/types";
import { TaskForm } from "./TaskForm";
import { TaskItem } from "./TaskItem";
import { TaskLearningSlotModal } from "./TaskLearningSlotModal";

interface TaskListProps {
  planId: string;
  subject: string;
  tasks: TaskDTO[];
  onChanged: () => void;
}

export function TaskList({ planId, subject, tasks, onChanged }: TaskListProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);
  const [slotTask, setSlotTask] = useState<TaskDTO | null>(null);

  const open = tasks.filter((t) => !t.completed);
  const done = tasks.filter((t) => t.completed);

  function openCreate() {
    setEditTask(null);
    setFormOpen(true);
  }

  function openEdit(task: TaskDTO) {
    setEditTask(task);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Aufgaben
        </p>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#ef233c" }}
        >
          <Plus className="w-3.5 h-3.5" />
          Aufgabe
        </button>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-8 text-center">
          <CircleCheckBig className="w-6 h-6 text-gray-300" />
          <p className="text-xs text-gray-500">
            Noch keine Aufgaben. Lege fest, was du für dieses Ziel erledigen willst.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {open.map((task) => (
            <TaskItem
              key={task.id}
              planId={planId}
              task={task}
              onChanged={onChanged}
              onEdit={openEdit}
              onCreateSlot={setSlotTask}
            />
          ))}

          {done.length > 0 && (
            <>
              {open.length > 0 && (
                <p className="text-xs font-medium text-gray-400 mt-2 px-1">
                  Erledigt ({done.length})
                </p>
              )}
              {done.map((task) => (
                <TaskItem
                  key={task.id}
                  planId={planId}
                  task={task}
                  onChanged={onChanged}
                  onEdit={openEdit}
                  onCreateSlot={setSlotTask}
                />
              ))}
            </>
          )}
        </div>
      )}

      <TaskForm
        open={formOpen}
        planId={planId}
        task={editTask}
        onClose={() => setFormOpen(false)}
        onSaved={onChanged}
      />

      <TaskLearningSlotModal
        open={slotTask !== null}
        planId={planId}
        subject={subject}
        task={slotTask}
        onClose={() => setSlotTask(null)}
        onCreated={onChanged}
      />
    </div>
  );
}
