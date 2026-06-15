"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle, Calculator, CalendarPlus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MAX_SESSIONS_PER_SUBJECT_PER_DAY,
  SLOT_HOURS,
} from "@/lib/study-plan/scheduler";
import type { StudyPlanDTO } from "@/lib/study-plan/types";

interface AlgorithmResultWidgetProps {
  plan: StudyPlanDTO;
  /** Nach erfolgreicher Neuberechnung aufgerufen (Caller lädt neu). */
  onRecalculated: () => void;
  onReplanned?: () => void;
  /** Öffnet die Kalender-Planung (Vorschau-Modal). */
  onSchedule?: () => void;
}

export function AlgorithmResultWidget({
  plan,
  onRecalculated,
  onReplanned,
  onSchedule,
}: AlgorithmResultWidgetProps) {
  const [busyAction, setBusyAction] = useState<"calculate" | "replan" | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const hasResult = plan.totalHours != null && plan.planType != null;
  const hasInputs =
    plan.difficulty != null &&
    plan.priorKnowledge != null &&
    plan.pages != null &&
    plan.credits != null;
  const isKritisch = plan.planType === "kritisch";
  const maxSubjectHoursPerDay = MAX_SESSIONS_PER_SUBJECT_PER_DAY * SLOT_HOURS;
  async function recalculate() {
    setBusyAction("calculate");
    setActionMessage(null);
    try {
      // PATCH ohne Änderungen → Server rechnet mit gespeicherten Eingaben
      // und dem aktuellen Datum neu (Tage bis Deadline ändern sich täglich).
      const res = await fetch(`/api/study-plan/${plan.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (res.ok) {
        onRecalculated();
      } else {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setActionMessage(data?.error ?? "Neuberechnung fehlgeschlagen.");
      }
    } finally {
      setBusyAction(null);
    }
  }

  async function replan() {
    setBusyAction("replan");
    setActionMessage(null);
    try {
      const res = await fetch(`/api/study-plan/${plan.id}/replan`, {
        method: "POST",
      });
      const data = (await res.json().catch(() => null)) as
        | { error?: string; updatedTaskCount?: number; warnings?: string[] }
        | null;
      if (!res.ok) {
        setActionMessage(data?.error ?? "Umplanung fehlgeschlagen.");
        return;
      }

      const count = data?.updatedTaskCount ?? 0;
      setActionMessage(
        count > 0
          ? `${count} offene Aufgaben wurden neu verteilt.`
          : data?.warnings?.[0] ?? "Keine offenen Aufgaben mussten verschoben werden.",
      );
      onReplanned?.();
    } catch {
      setActionMessage("Umplanung fehlgeschlagen.");
    } finally {
      setBusyAction(null);
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
            disabled={busyAction !== null}
            className="flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 rounded-lg hover:bg-gray-100 hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw
              className={cn(
                "w-3.5 h-3.5",
                busyAction === "calculate" && "animate-spin",
              )}
            />
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
                {isKritisch ? `max. ${maxSubjectHoursPerDay}` : plan.hoursPerDay} h
              </span>
              <span className="text-xs text-gray-500 mt-0.5">
                {isKritisch ? "dieses Fach pro Tag" : "pro Tag geplant"}
              </span>
            </div>
          </div>

          {isKritisch && (
            <p className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-2">
              Rechnerisch wären {plan.hoursPerDay} h pro Tag nötig. Automatisch geplant werden
              maximal zwei 2-Stunden-Einheiten dieses Fachs pro Tag – priorisiere die wichtigsten
              Inhalte und plane Pausen ein.
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

          {onReplanned && (
            <button
              type="button"
              onClick={() => void replan()}
              disabled={busyAction !== null}
              className="flex items-center justify-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw
                className={cn(
                  "w-4 h-4",
                  busyAction === "replan" && "animate-spin",
                )}
              />
              Offene Aufgaben neu verteilen
            </button>
          )}

          {actionMessage && (
            <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-600">
              {actionMessage}
            </p>
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
