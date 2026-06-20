"use client";

import { useState } from "react";
import { BookOpen, Plus } from "lucide-react";
import { useStudyPlans } from "@/lib/study-plan/useStudyPlans";
import type { StudyPlanSummaryDTO } from "@/lib/study-plan/types";
import { StudyPlanCard } from "./StudyPlanCard";
import { StudyPlanForm } from "./StudyPlanForm";

interface StudyPlanOverviewProps {
  initialCreateOpen?: boolean;
}

export function StudyPlanOverview({ initialCreateOpen = false }: StudyPlanOverviewProps) {
  const { plans, loading, error, refresh } = useStudyPlans();

  const [formOpen, setFormOpen] = useState(initialCreateOpen);
  const [editPlan, setEditPlan] = useState<StudyPlanSummaryDTO | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<StudyPlanSummaryDTO | null>(null);
  const [deleting, setDeleting] = useState(false);

  function openCreate() {
    setEditPlan(null);
    setFormOpen(true);
  }

  function openEdit(plan: StudyPlanSummaryDTO) {
    setEditPlan(plan);
    setFormOpen(true);
  }

  async function confirmDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/study-plan/${deleteTarget.id}`, { method: "DELETE" });
      if (res.ok) await refresh();
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-red/10">
            <BookOpen className="w-5 h-5 text-brand-red" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Meine Lernpläne</h1>
            <p className="text-sm text-gray-500">
              Plane deine Klausuren und behalte den Fortschritt im Blick.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95"
          style={{ backgroundColor: "#ef233c" }}
        >
          <Plus className="w-4 h-4" />
          Neuer Lernplan
        </button>
      </div>

      {/* Inhalt */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-48 rounded-2xl border border-gray-200 bg-gray-50 animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : plans.length === 0 ? (
        /* Leerer Zustand */
        <div className="flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-brand-red/10">
            <BookOpen className="w-8 h-8 text-brand-red" />
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-gray-800">Noch keine Lernpläne</p>
            <p className="text-sm text-gray-500 mt-1 max-w-sm">
              Lege deinen ersten Lernplan an – mit Klausurdatum, Schwierigkeit und Umfang
              berechnet LearnHub deinen Lernaufwand.
            </p>
          </div>
          <button
            type="button"
            onClick={openCreate}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95"
            style={{ backgroundColor: "#ef233c" }}
          >
            <Plus className="w-4 h-4" />
            Ersten Lernplan anlegen
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {plans.map((plan) => (
            <StudyPlanCard
              key={plan.id}
              plan={plan}
              onEdit={openEdit}
              onDelete={setDeleteTarget}
            />
          ))}
        </div>
      )}

      {/* Anlegen / Bearbeiten */}
      <StudyPlanForm
        open={formOpen}
        plan={editPlan}
        onClose={() => setFormOpen(false)}
        onSaved={() => void refresh()}
      />

      {/* Lösch-Bestätigung */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            className="w-full max-w-sm rounded-2xl bg-white shadow-xl border border-gray-200 p-5 flex flex-col gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h3 className="text-base font-bold text-gray-900">Lernplan löschen?</h3>
              <p className="text-sm text-gray-500 mt-1">
                „{deleteTarget.title}“ wird mit allen Aufgaben gelöscht. Bereits geplante
                Kalender-Termine bleiben erhalten.
              </p>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={() => void confirmDelete()}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg bg-red-600 hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {deleting ? "Löschen…" : "Löschen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
