"use client";

import { useEffect, useState } from "react";
import { Calculator, X } from "lucide-react";
import { GOAL_TYPE_META, fromDateInputValue, toDateInputValue } from "./planMeta";
import type { StudyPlanDTO } from "@/lib/study-plan/types";
import { GOAL_TYPES } from "@/lib/study-plan/types";

interface StudyPlanFormProps {
  open: boolean;
  /** Bestehender Plan → Bearbeiten-Modus; null → Anlegen. */
  plan: StudyPlanDTO | null;
  onClose: () => void;
  /** Wird nach erfolgreichem Speichern aufgerufen (Caller lädt neu). */
  onSaved: (planId: string) => void;
}

const inputClass =
  "rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-red/30 focus:border-brand-red";
const selectClass =
  "h-9 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20";

export function StudyPlanForm({ open, plan, onClose, onSaved }: StudyPlanFormProps) {
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [goalType, setGoalType] = useState<string>("KLAUSUR");
  const [targetDate, setTargetDate] = useState("");
  const [difficulty, setDifficulty] = useState("3");
  const [priorKnowledge, setPriorKnowledge] = useState("3");
  const [pages, setPages] = useState("");
  const [credits, setCredits] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Felder beim Öffnen befüllen (Bearbeiten) bzw. zurücksetzen (Anlegen)
  useEffect(() => {
    if (!open) return;
    setTitle(plan?.title ?? "");
    setSubject(plan?.subject ?? "");
    setDescription(plan?.description ?? "");
    setGoalType(plan?.goalType ?? "KLAUSUR");
    setTargetDate(plan ? toDateInputValue(plan.targetDate) : "");
    setDifficulty(plan?.difficulty ? String(plan.difficulty) : "3");
    setPriorKnowledge(plan?.priorKnowledge ? String(plan.priorKnowledge) : "3");
    setPages(plan?.pages ? String(plan.pages) : "");
    setCredits(plan?.credits ? String(plan.credits) : "");
    setError(null);
    setSaving(false);
  }, [open, plan]);

  // ESC schließt Modal
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !subject.trim() || !targetDate) {
      setError("Bitte Titel, Fach und Zieldatum ausfüllen.");
      return;
    }

    const target = fromDateInputValue(targetDate);
    if (!plan && target.getTime() < new Date().setHours(0, 0, 0, 0)) {
      setError("Das Zieldatum muss in der Zukunft liegen.");
      return;
    }

    const body = {
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim() || null,
      goalType,
      targetDate: target.toISOString(),
      difficulty: Number(difficulty),
      priorKnowledge: Number(priorKnowledge),
      pages: pages.trim() ? Number(pages) : null,
      credits: credits.trim() ? Number(credits) : null,
    };

    setSaving(true);
    try {
      const res = await fetch(plan ? `/api/study-plan/${plan.id}` : "/api/study-plan", {
        method: plan ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => null)) as
        | { studyPlan?: StudyPlanDTO; error?: string }
        | null;
      if (!res.ok || !data?.studyPlan) {
        throw new Error(data?.error ?? "Speichern fehlgeschlagen.");
      }
      onSaved(data.studyPlan.id);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Speichern fehlgeschlagen.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="study-plan-form-title"
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white shadow-xl border border-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h3 id="study-plan-form-title" className="text-lg font-bold text-gray-900">
            {plan ? "Lernplan bearbeiten" : "Neuer Lernplan"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Schließen"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-5 py-4 flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="sp-title" className="text-xs font-semibold text-gray-700">
              Titel
            </label>
            <input
              id="sp-title"
              type="text"
              required
              autoFocus
              maxLength={100}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="z. B. Klausurvorbereitung Mathe 2"
              className={inputClass}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="sp-subject" className="text-xs font-semibold text-gray-700">
                Veranstaltung / Fach
              </label>
              <input
                id="sp-subject"
                type="text"
                required
                maxLength={100}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="z. B. Mathematik 2"
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1">
              <label htmlFor="sp-goal-type" className="text-xs font-semibold text-gray-700">
                Zieltyp
              </label>
              <select
                id="sp-goal-type"
                className={selectClass}
                value={goalType}
                onChange={(e) => setGoalType(e.target.value)}
              >
                {GOAL_TYPES.map((g) => (
                  <option key={g} value={g}>
                    {GOAL_TYPE_META[g].label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sp-target-date" className="text-xs font-semibold text-gray-700">
              Zieldatum
            </label>
            <input
              id="sp-target-date"
              type="date"
              required
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className={inputClass}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="sp-description" className="text-xs font-semibold text-gray-700">
              Beschreibung <span className="font-normal text-gray-400">(optional)</span>
            </label>
            <textarea
              id="sp-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Worum geht es in diesem Lernplan?"
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* Algorithmus-Sektion */}
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-brand-red" />
              <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Lernaufwand berechnen
              </p>
            </div>
            <p className="text-xs text-gray-500 -mt-1">
              Wenn Seiten und ECTS angegeben sind, wird der Lernaufwand automatisch berechnet.
            </p>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="sp-difficulty" className="text-xs font-semibold text-gray-700">
                  Schwierigkeit
                </label>
                <select
                  id="sp-difficulty"
                  className={selectClass}
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value)}
                >
                  <option value="1">1 – Leicht</option>
                  <option value="2">2 – Eher leicht</option>
                  <option value="3">3 – Mittel</option>
                  <option value="4">4 – Schwer</option>
                  <option value="5">5 – Sehr schwer</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sp-knowledge" className="text-xs font-semibold text-gray-700">
                  Vorwissen
                </label>
                <select
                  id="sp-knowledge"
                  className={selectClass}
                  value={priorKnowledge}
                  onChange={(e) => setPriorKnowledge(e.target.value)}
                >
                  <option value="1">1 – Kaum Vorwissen</option>
                  <option value="2">2 – Wenig Vorwissen</option>
                  <option value="3">3 – Mittel</option>
                  <option value="4">4 – Gut</option>
                  <option value="5">5 – Sehr gut</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="sp-pages" className="text-xs font-semibold text-gray-700">
                  Seiten / Folien
                </label>
                <input
                  id="sp-pages"
                  type="number"
                  min={1}
                  placeholder="z. B. 120"
                  value={pages}
                  onChange={(e) => setPages(e.target.value)}
                  className={inputClass}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="sp-credits" className="text-xs font-semibold text-gray-700">
                  ECTS-Punkte
                </label>
                <input
                  id="sp-credits"
                  type="number"
                  min={1}
                  max={10}
                  placeholder="z. B. 5"
                  value={credits}
                  onChange={(e) => setCredits(e.target.value)}
                  className={inputClass}
                />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex flex-col gap-2 pt-2 border-t border-gray-100">
            {error && (
              <p className="text-xs font-medium text-red-600 bg-red-50 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              >
                Abbrechen
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-4 py-2 text-sm font-bold text-white rounded-lg shadow-sm transition-opacity hover:opacity-90 active:scale-95 disabled:opacity-50"
                style={{ backgroundColor: "#ef233c" }}
              >
                {saving ? "Speichern…" : "Speichern"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
