"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, CircleCheckBig, MoreVertical, Pencil, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudyPlanSummaryDTO } from "@/lib/study-plan/types";
import { GOAL_TYPE_META, formatDate, remainingLabel } from "./planMeta";

interface StudyPlanCardProps {
  plan: StudyPlanSummaryDTO;
  onEdit: (plan: StudyPlanSummaryDTO) => void;
  onDelete: (plan: StudyPlanSummaryDTO) => void;
}

export function StudyPlanCard({ plan, onEdit, onDelete }: StudyPlanCardProps) {
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const meta = GOAL_TYPE_META[plan.goalType];
  const GoalIcon = meta.icon;
  const remaining = remainingLabel(plan.targetDate);
  const progress =
    plan.taskCount > 0
      ? Math.round((plan.completedTaskCount / plan.taskCount) * 100)
      : 0;

  return (
    <div
      role="link"
      tabIndex={0}
      onClick={() => router.push(`/study-plan/${plan.id}`)}
      onKeyDown={(e) => {
        if (e.key === "Enter") router.push(`/study-plan/${plan.id}`);
      }}
      className="group relative flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-red/30"
    >
      {/* Kopf: Badge + Menü */}
      <div className="flex items-start justify-between gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
            meta.badgeClass,
          )}
        >
          <GoalIcon className="w-3.5 h-3.5" />
          {meta.label}
        </span>

        <div className="relative">
          <button
            type="button"
            aria-label="Aktionen"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((v) => !v);
            }}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              {/* Unsichtbarer Backdrop zum Schließen */}
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpen(false);
                }}
              />
              <div className="absolute right-0 top-8 z-20 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onEdit(plan);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Pencil className="w-4 h-4 text-gray-400" />
                  Bearbeiten
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuOpen(false);
                    onDelete(plan);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Löschen
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Titel + Fach */}
      <div>
        <h3 className="text-base font-bold text-gray-900 leading-snug">{plan.title}</h3>
        <p className="text-sm text-gray-500">{plan.subject}</p>
      </div>

      {/* Zieldatum */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <CalendarDays className="w-4 h-4 text-gray-400" />
        <span>{formatDate(plan.targetDate)}</span>
        <span className={cn("text-xs font-medium", remaining.className)}>
          {remaining.text}
        </span>
      </div>

      {/* Fortschritt */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-500">
            {plan.taskCount > 0
              ? `${plan.completedTaskCount} von ${plan.taskCount} Aufgaben erledigt`
              : "Noch keine Aufgaben"}
          </span>
          {plan.taskCount > 0 && (
            <span className="font-semibold text-gray-700">{progress}%</span>
          )}
        </div>
        <div className="h-1.5 w-full rounded-full bg-gray-200">
          <div
            className="h-1.5 rounded-full bg-brand-red transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Nächste Aufgabe */}
      {plan.nextTask && (
        <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
          <CircleCheckBig className="w-3.5 h-3.5 shrink-0 text-gray-400" />
          <span className="truncate">
            Nächste Aufgabe: <strong className="font-semibold">{plan.nextTask.title}</strong>
            {" · "}
            {formatDate(plan.nextTask.dueDate)}
          </span>
        </div>
      )}
    </div>
  );
}
