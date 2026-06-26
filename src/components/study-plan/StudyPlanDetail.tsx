"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CalendarDays, Pencil, RefreshCw } from "lucide-react";
import { useLanguage } from "@/lib/i18n/LanguageProvider";
import { cn } from "@/lib/utils";
import { calculateTaskProgress } from "@/lib/study-plan/progress";
import type { StudyPlanDetailDTO } from "@/lib/study-plan/types";
import { GOAL_TYPE_META, formatDate, remainingLabel } from "./planMeta";
import { AlgorithmResultWidget } from "./AlgorithmResultWidget";
import { SchedulePreviewModal } from "./SchedulePreviewModal";
import { StudyPlanForm } from "./StudyPlanForm";
import { TaskList } from "./TaskList";

interface StudyPlanDetailProps {
  planId: string;
}

export function StudyPlanDetail({ planId }: StudyPlanDetailProps) {
  const { t } = useLanguage();
  const [plan, setPlan] = useState<StudyPlanDetailDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [replanBusy, setReplanBusy] = useState(false);
  const [replanResult, setReplanResult] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/study-plan/${planId}`);
      if (res.status === 404) {
        setError("Dieser Lernplan existiert nicht (mehr).");
        setPlan(null);
        return;
      }
      if (!res.ok) throw new Error("Lernplan konnte nicht geladen werden.");
      const data = (await res.json()) as { studyPlan?: StudyPlanDetailDTO };
      setPlan(data.studyPlan ?? null);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }, [planId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function replanPlan() {
    setReplanBusy(true);
    setReplanResult(null);
    try {
      const res = await fetch(`/api/study-plan/${planId}/replan`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; updatedTaskCount?: number; warnings?: string[] }
        | null;

      if (!res.ok) {
        setReplanResult({
          type: "error",
          message: data?.error ?? "Plan konnte nicht neu verteilt werden.",
        });
        return;
      }

      const updatedTaskCount = data?.updatedTaskCount ?? 0;
      const warning = data?.warnings?.[0];
      setReplanResult({
        type: "success",
        message:
          updatedTaskCount > 0
            ? `${updatedTaskCount} offene ${
                updatedTaskCount === 1 ? "Aufgabe wurde" : "Aufgaben wurden"
              } neu verteilt. Erledigte Aufgaben bleiben unverändert.`
            : warning ?? "Keine offenen Aufgaben mussten verschoben werden.",
      });
      await refresh();
    } catch {
      setReplanResult({
        type: "error",
        message: "Plan konnte nicht neu verteilt werden.",
      });
    } finally {
      setReplanBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col h-full p-6 gap-4">
        <div className="h-8 w-48 rounded-lg bg-gray-100 animate-pulse" />
        <div className="h-32 rounded-2xl bg-gray-100 animate-pulse" />
        <div className="h-64 rounded-2xl bg-gray-100 animate-pulse" />
      </div>
    );
  }

  if (error || !plan) {
    return (
      <div className="flex flex-col h-full p-6 gap-4">
        <Link
          href="/study-plan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Übersicht
        </Link>
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error ?? "Lernplan nicht gefunden."}
        </div>
      </div>
    );
  }

  const meta = GOAL_TYPE_META[plan.goalType];
  const GoalIcon = meta.icon;
  const remaining = remainingLabel(plan.targetDate);
  const {
    completedTaskCount: completedCount,
    percentage: progress,
  } = calculateTaskProgress(plan.tasks);

  return (
    <div className="flex flex-col h-full p-6 gap-5 overflow-auto">
      {/* Zurück + Aktionen */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link
          href="/study-plan"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Übersicht
        </Link>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <button
            type="button"
            onClick={() => void replanPlan()}
            disabled={replanBusy}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn("w-4 h-4 text-gray-500", replanBusy && "animate-spin")}
            />
            Plan neu verteilen
          </button>
          <button
            type="button"
            onClick={() => setEditOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Pencil className="w-4 h-4 text-gray-500" />
            Bearbeiten
          </button>
        </div>
      </div>

      {/* Plan-Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-2xl font-bold text-gray-900">{plan.title}</h1>
          <span
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold",
              meta.badgeClass,
            )}
          >
            <GoalIcon className="w-3.5 h-3.5" />
            {meta.label}
          </span>
        </div>
        <p className="text-sm text-gray-500">{plan.subject}</p>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <CalendarDays className="w-4 h-4 text-gray-400" />
          <span>{formatDate(plan.targetDate)}</span>
          {plan.targetDateEnd && (
            <span className="text-gray-400">
              {new Date(plan.targetDate).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
              {" – "}
              {new Date(plan.targetDateEnd).toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}
              {" Uhr"}
            </span>
          )}
          <span className={cn("text-xs font-medium", remaining.className)}>
            {remaining.text}
          </span>
        </div>
        {plan.description && (
          <p className="text-sm text-gray-500 max-w-2xl">{plan.description}</p>
        )}
      </div>

      {replanResult && (
        <div
          role={replanResult.type === "error" ? "alert" : "status"}
          aria-live={replanResult.type === "error" ? "assertive" : "polite"}
          className={cn(
            "rounded-xl border px-4 py-3 text-sm",
            replanResult.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {replanResult.message}
        </div>
      )}

      {/* Widgets: Fortschritt + Algorithmus */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Fortschritt
          </p>
          <div className="flex items-end justify-between gap-2">
            <span className="text-3xl font-bold text-gray-900">{progress}%</span>
            <span className="text-sm text-gray-500">
              {plan.tasks.length > 0
                ? `${completedCount} von ${plan.tasks.length} Aufgaben erledigt`
                : t("Noch keine Aufgaben")}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200">
            <div
              className="h-2 rounded-full bg-brand-red transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <AlgorithmResultWidget
          plan={plan}
          onRecalculated={() => void refresh()}
          onSchedule={() => setScheduleOpen(true)}
        />
      </div>

      {/* Aufgaben */}
      <TaskList
        planId={plan.id}
        subject={plan.subject}
        tasks={plan.tasks}
        onChanged={() => void refresh()}
      />

      {/* Bearbeiten-Modal */}
      <StudyPlanForm
        open={editOpen}
        plan={plan}
        onClose={() => setEditOpen(false)}
        onSaved={() => void refresh()}
      />

      {/* Kalender-Planung (Vorschau + Eintragen) */}
      <SchedulePreviewModal
        open={scheduleOpen}
        plan={plan}
        onClose={() => setScheduleOpen(false)}
        onScheduled={() => void refresh()}
      />
    </div>
  );
}
