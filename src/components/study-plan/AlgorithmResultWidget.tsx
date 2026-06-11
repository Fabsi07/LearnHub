"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Calculator, CalendarPlus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StudyPlanDTO } from "@/lib/study-plan/types";

interface AlgorithmResultWidgetProps {
  plan: StudyPlanDTO;
  /** Nach erfolgreicher Neuberechnung aufgerufen (Caller lädt neu). */
  onRecalculated: () => void;
  /** Öffnet die Kalender-Planung (Vorschau-Modal). */
  onSchedule?: () => void;
}

export function AlgorithmResultWidget({
  plan,
  onRecalculated,
  onSchedule,
}: AlgorithmResultWidgetProps) {
  const [busy, setBusy] = useState(false);

  const hasResult = plan.totalHours != null && plan.planType != null;
  const hasInputs =
    plan.difficulty != null &&
    plan.priorKnowledge != null &&
    plan.pages != null &&
    plan.credits != null;
  const isKritisch = plan.planType === "kritisch";
  async function recalculate() {
    setBusy(true);
    try {
      // PATCH ohne Änderungen → Server rechnet mit gespeicherten Eingaben
      // und dem aktuellen Datum neu (Tage bis Deadline ändern sich täglich).
      const res = await fetch(`/api/study-plan/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) onRecalculated();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Lernaufwand
        </p>
        {hasInputs && (
          <button
            type="button"
            onClick={() => void recalculate()}
            disabled={busy}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", busy && "animate-spin")} />
            Neu berechnen
          </button>
        )}
      </div>

      {hasResult ? (
        <>
          {/* Plantyp */}
          <div
            className={cn(
              "flex items-center gap-2 rounded-xl px-3 py-2.5",
              isKritisch
                ? "bg-red-50 border border-red-200"
                : "bg-green-50 border border-green-200",
            )}
          >
            {isKritisch ? (
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0" />
            ) : (
              <CheckCircle className="w-5 h-5 text-green-600 shrink-0" />
            )}
            <div>
              <p
                className={cn(
                  "text-sm font-bold",
                  isKritisch ? "text-red-700" : "text-green-700",
                )}
              >
                {isKritisch ? "Kritischer Lernplan" : "Normaler Lernplan"}
              </p>
              <p className="text-xs text-gray-500">
                {isKritisch
                  ? "Wenig Zeit – Fokus auf das Wesentliche."
                  : "Ausreichend Zeit für nachhaltiges Lernen."}
              </p>
            </div>
          </div>

          {/* Kennzahlen */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
              <span className="text-xl font-bold text-gray-900">{plan.totalHours} h</span>
              <span className="text-xs text-gray-500 mt-0.5">Gesamtstunden</span>
            </div>
            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
              <span className="text-xl font-bold text-gray-900">
                {isKritisch ? "2" : plan.hoursPerDay} h
              </span>
              <span className="text-xs text-gray-500 mt-0.5">pro Tag geplant</span>
            </div>
          </div>

          {isKritisch && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Rechnerisch wären {plan.hoursPerDay} h pro Tag nötig. Angezeigt werden maximal
              2 h pro Tag – priorisiere die wichtigsten Inhalte.
            </p>
          )}

          {onSchedule && (
            <button
              type="button"
              onClick={onSchedule}
              className="flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95"
              style={{ backgroundColor: "#ef233c" }}
            >
              <CalendarPlus className="w-4 h-4" />
              In Kalender eintragen
            </button>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
          <Calculator className="w-6 h-6 text-gray-300" />
          <p className="text-xs text-gray-500 max-w-55">
            Noch keine Berechnung. Bearbeite den Lernplan und gib Seiten + ECTS an, um den
            Lernaufwand zu berechnen.
          </p>
        </div>
      )}
    </div>
  );
}
