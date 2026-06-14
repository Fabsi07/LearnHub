"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CalendarCheck, CalendarPlus, CheckCircle, X } from "lucide-react";
import type { CalEvent, RepeatRule } from "@/components/calendar/events";
import { calculateStudyPlan } from "@/lib/calculations/studyPlanAlgorithm";
import {
  analyzeWorkload,
  scheduleStudyPlan,
  SLOT_HOURS,
  type ScheduleResult,
} from "@/lib/study-plan/scheduler";
import type { StudyPlanDetailDTO, TaskDTO } from "@/lib/study-plan/types";
import { formatDate } from "./planMeta";

interface SchedulePreviewModalProps {
  open: boolean;
  plan: StudyPlanDetailDTO;
  onClose: () => void;
  /** Nach erfolgreichem Eintragen aufgerufen. */
  onScheduled: () => void;
}

type ApiEvent = Omit<CalEvent, "start" | "end"> & { start: string; end: string };

function deserialize(events: ApiEvent[]): CalEvent[] {
  return events.map((e) => ({ ...e, start: new Date(e.start), end: new Date(e.end) }));
}

function formatTime(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const WEEKDAYS = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];

export function SchedulePreviewModal({
  open,
  plan,
  onClose,
  onScheduled,
}: SchedulePreviewModalProps) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [schedule, setSchedule] = useState<ScheduleResult | null>(null);
  const [criticalNotes, setCriticalNotes] = useState<string[]>([]);
  const [existingPlanEvents, setExistingPlanEvents] = useState(0);
  const [saving, setSaving] = useState(false);
  const [savedCount, setSavedCount] = useState<number | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const savingRef = useRef(false);

  const canCalculate =
    plan.difficulty != null &&
    plan.priorKnowledge != null &&
    plan.pages != null &&
    plan.credits != null;

  // Beim Öffnen: bestehende Termine laden und Plan berechnen
  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setLoadError(null);
    setSchedule(null);
    setCriticalNotes([]);
    setSaveError(null);

    if (!canCalculate) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const [localRes, externalRes] = await Promise.all([
          fetch("/api/calendar/events"),
          fetch("/api/calendar/external"),
        ]);
        const localData = localRes.ok
          ? ((await localRes.json()) as { events?: ApiEvent[] })
          : { events: [] };
        const externalData = externalRes.ok
          ? ((await externalRes.json()) as { events?: ApiEvent[] })
          : { events: [] };
        if (cancelled) return;

        const localEvents = deserialize(localData.events ?? []);
        const externalEvents = deserialize(externalData.events ?? []);
        setExistingPlanEvents(
          localEvents.filter((e) => e.studyPlanId === plan.id).length,
        );

        const result = calculateStudyPlan({
          deadlineDate: new Date(plan.targetDate),
          difficulty: plan.difficulty as 1 | 2 | 3 | 4 | 5,
          priorKnowledge: plan.priorKnowledge as 1 | 2 | 3 | 4 | 5,
          pages: plan.pages as number,
          credits: plan.credits as number,
        });

        const scheduled = scheduleStudyPlan(
          result,
          { deadline: new Date(plan.targetDate), subject: plan.subject },
          [...localEvents, ...externalEvents],
        );
        setSchedule(scheduled);
        // Kritische Anmerkungen: zu viel Lernen pro Tag / ein Fach zu oft pro Woche
        setCriticalNotes(
          analyzeWorkload(scheduled.sessions, localEvents, plan.subject),
        );
      } catch {
        if (!cancelled) {
          setLoadError("Bestehende Termine konnten nicht geladen werden.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, plan, canCalculate]);

  // Den Erfolgszustand erst beim Schließen zurücksetzen. Ein Refresh des
  // Lernplans nach dem Speichern liefert ein neues plan-Objekt und darf die
  // Erfolgsmeldung nicht wieder durch die Vorschau ersetzen.
  useEffect(() => {
    if (!open) {
      setSavedCount(null);
      setSaveError(null);
      savingRef.current = false;
    }
  }, [open]);

  // ESC schließt Modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !savingRef.current) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Sessions nach Kalenderwoche (Montag) gruppieren
  const weeks = useMemo(() => {
    if (!schedule) return [];
    const map = new Map<string, typeof schedule.sessions>();
    for (const s of schedule.sessions) {
      const monday = new Date(s.start);
      monday.setHours(0, 0, 0, 0);
      const day = monday.getDay();
      monday.setDate(monday.getDate() - (day === 0 ? 6 : day - 1));
      const key = monday.toISOString();
      map.set(key, [...(map.get(key) ?? []), s]);
    }
    return [...map.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, sessions]) => ({ monday: new Date(key), sessions }));
  }, [schedule]);

  if (!open) return null;

  async function handleConfirm() {
    if (savingRef.current || !schedule || schedule.sessions.length === 0) return;
    savingRef.current = true;
    setSaving(true);
    setSaveError(null);
    let created = 0;
    try {
      for (const s of schedule.sessions) {
        // 1) Aufgabe im Lernplan anlegen – jede Lerneinheit ist abhakbar und
        //    zählt in den Plan-Fortschritt.
        const pad = (n: number) => n.toString().padStart(2, "0");
        const dayLabel = `${pad(s.start.getDate())}.${pad(s.start.getMonth() + 1)}.`;
        const taskRes = await fetch(`/api/study-plan/${plan.id}/tasks`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Lernsession ${dayLabel}: ${s.shortPhase}`,
            description: s.tasks.join("\n"),
            dueDate: s.start.toISOString(),
            estimatedMinutes: SLOT_HOURS * 60,
            difficulty: plan.difficulty ?? 3,
          }),
        });
        const taskData = (await taskRes.json().catch(() => null)) as
          | { task?: TaskDTO }
          | null;
        if (!taskRes.ok || !taskData?.task) {
          throw new Error(`Aufgabe für Termin ${created + 1} konnte nicht angelegt werden.`);
        }

        // 2) Kalendertermin anlegen und mit der Aufgabe verknüpfen.
        const res = await fetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: `Lernsession: ${plan.subject}`,
            start: s.start.toISOString(),
            end: s.end.toISOString(),
            allDay: false,
            type: "Lernsession",
            subject: plan.subject,
            notes: s.phaseName,
            tasks: s.tasks.join("\n"),
            repeat: "none" satisfies RepeatRule,
            studyPlanId: plan.id,
            taskId: taskData.task.id,
          }),
        });
        if (!res.ok) {
          throw new Error(`Termin ${created + 1} konnte nicht gespeichert werden.`);
        }
        created++;
      }
      setSavedCount(created);
      onScheduled();
    } catch (err) {
      setSaveError(
        err instanceof Error
          ? `${err.message} (${created} von ${schedule.sessions.length} gespeichert)`
          : "Speichern fehlgeschlagen.",
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={() => {
        if (!savingRef.current) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-preview-title"
        className="w-full max-w-2xl max-h-[90vh] flex flex-col rounded-2xl bg-white shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <CalendarPlus className="w-5 h-5 text-brand-red" />
            <h3 id="schedule-preview-title" className="text-lg font-bold text-gray-900">
              Lernplan in Kalender eintragen
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
          {savedCount != null ? (
            /* Erfolg */
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-green-50">
                <CalendarCheck className="w-7 h-7 text-green-600" />
              </div>
              <p className="text-base font-semibold text-gray-900">
                {savedCount} Lerneinheiten eingetragen
              </p>
              <p className="text-sm text-gray-500 max-w-sm">
                Die Termine sind jetzt im Kalender sichtbar und können dort per Drag &amp;
                Drop verschoben werden. Jede Einheit ist außerdem als abhakbare Aufgabe
                mit diesem Lernplan verknüpft.
              </p>
            </div>
          ) : !canCalculate ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Für diesen Lernplan fehlen Algorithmus-Eingaben (Schwierigkeit, Vorwissen,
              Seiten, ECTS). Bearbeite den Plan und ergänze sie, um Lerneinheiten zu planen.
            </div>
          ) : loading ? (
            <div className="flex flex-col gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-xl bg-gray-100 animate-pulse" />
              ))}
            </div>
          ) : loadError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {loadError}
            </div>
          ) : schedule ? (
            <>
              {/* Zusammenfassung */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  {
                    label: "Lerneinheiten",
                    value: `${schedule.sessions.length}`,
                  },
                  { label: "pro Einheit", value: `${SLOT_HOURS} h` },
                  {
                    label: "bis zur Deadline",
                    value: formatDate(plan.targetDate),
                  },
                ].map(({ label, value }) => (
                  <div
                    key={label}
                    className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 p-3 text-center"
                  >
                    <span className="text-lg font-bold text-gray-900">{value}</span>
                    <span className="text-xs text-gray-500 mt-0.5">{label}</span>
                  </div>
                ))}
              </div>

              {/* Hinweis: bereits geplante Einheiten */}
              {existingPlanEvents > 0 && (
                <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    Für diesen Lernplan existieren bereits {existingPlanEvents} Termine im
                    Kalender. Beim Übernehmen kommen die neuen Einheiten dazu.
                  </span>
                </div>
              )}

              {/* Warnungen aus dem Scheduler */}
              {schedule.warnings.map((w) => (
                <div
                  key={w}
                  className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{w}</span>
                </div>
              ))}

              {/* Kritische Anmerkungen zum Workload (zu viel pro Tag / Fach zu oft) */}
              {criticalNotes.map((note) => (
                <div
                  key={note}
                  className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                >
                  <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>
                    <span className="font-semibold">Kritische Anmerkung: </span>
                    {note}
                  </span>
                </div>
              ))}

              {schedule.sessions.length === 0 ? (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                  Es konnten keine Lerneinheiten geplant werden.
                </div>
              ) : (
                /* Wochenübersicht */
                <div className="flex flex-col gap-4">
                  {weeks.map(({ monday, sessions }) => (
                    <div key={monday.toISOString()} className="flex flex-col gap-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Woche vom {formatDate(monday.toISOString())}
                      </p>
                      <div className="flex flex-col gap-1.5">
                        {sessions.map((s) => (
                          <div
                            key={s.start.toISOString()}
                            className="flex items-center gap-3 rounded-xl border border-gray-200 px-4 py-2.5"
                          >
                            <div className="flex flex-col items-center w-12 shrink-0">
                              <span className="text-xs text-gray-400">
                                {WEEKDAYS[s.start.getDay()]}
                              </span>
                              <span className="text-sm font-bold text-gray-900">
                                {s.start.getDate()}.{s.start.getMonth() + 1}.
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 w-28 shrink-0">
                              {formatTime(s.start)}–{formatTime(s.end)} Uhr
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700">
                                {s.shortPhase}
                              </span>
                              <p className="text-xs text-gray-500 mt-1 truncate">
                                {s.tasks.join(" · ")}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-gray-200 flex flex-col gap-2">
          {saveError && (
            <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
              {saveError}
            </p>
          )}
          <div className="flex items-center justify-end gap-2">
            {savedCount != null ? (
              <button
                type="button"
                onClick={onClose}
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90"
                style={{ backgroundColor: "#ef233c" }}
              >
                <CheckCircle className="w-4 h-4" />
                Fertig
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={saving}
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  Abbrechen
                </button>
                <button
                  type="button"
                  disabled={
                    saving || loading || !schedule || schedule.sessions.length === 0
                  }
                  onClick={() => void handleConfirm()}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                  style={{ backgroundColor: "#ef233c" }}
                >
                  <CalendarPlus className="w-4 h-4" />
                  {saving
                    ? "Wird eingetragen…"
                    : `In Kalender übernehmen${schedule ? ` (${schedule.sessions.length})` : ""}`}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
