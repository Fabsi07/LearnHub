"use client";

import { useState } from "react";
import { BookOpen, Calculator, AlertTriangle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import {
  calculateStudyPlan,
  CRITICAL_STUDY_HOURS_PER_DAY,
  type AlgorithmResult,
  type AlgorithmInput,
} from "@/lib/calculations/studyPlanAlgorithm";

export function StudyPlanPageContent() {
  const [result, setResult] = useState<AlgorithmResult | null>(null);

  const [form, setForm] = useState({
    deadline: "",
    difficulty: "3",
    priorKnowledge: "3",
    pages: "",
    credits: "",
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  // `new Date("YYYY-MM-DD")` wird als UTC geparst und kann in lokalen Zeitzonen um einen Tag verschoben sein.
  const [year, month, day] = form.deadline.split("-").map(Number);
  const deadlineDate = new Date(year, month - 1, day);

  const input: AlgorithmInput = {
    deadlineDate,
    difficulty: Number(form.difficulty) as AlgorithmInput["difficulty"],
    priorKnowledge: Number(form.priorKnowledge) as AlgorithmInput["priorKnowledge"],
    pages: Number(form.pages),
    credits: Number(form.credits),
  };
  setResult(calculateStudyPlan(input));
}

  const selectClass =
    "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm outline-none focus:border-brand-red focus:ring-2 focus:ring-brand-red/20";

  const plannedHoursPerDay =
    result?.planType === "kritisch"
      ? Math.min(result.hoursPerDay, CRITICAL_STUDY_HOURS_PER_DAY)
      : result?.hoursPerDay;

  return (
    <div className="flex flex-col h-full p-6 gap-6 overflow-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-brand-red/10">
          <BookOpen className="w-5 h-5 text-brand-red" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lernplan-Algorithmus</h1>
          <p className="text-sm text-gray-500">Gib deine Klausurdaten ein und erhalte einen persönlichen Lernplan.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Eingabe-Formular */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
        >
          <h2 className="text-base font-semibold text-gray-800">Klausur-Daten eingeben</h2>

          <div className="grid gap-2">
            <Label htmlFor="deadline">Klausurdatum</Label>
            <Input
              id="deadline"
              name="deadline"
              type="date"
              required
              value={form.deadline}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="difficulty">Schwierigkeit der Klausur (1 = leicht, 5 = sehr schwer)</Label>
            <select id="difficulty" name="difficulty" className={selectClass} value={form.difficulty} onChange={handleChange}>
              <option value="1">1 – Leicht</option>
              <option value="2">2 – Eher leicht</option>
              <option value="3">3 – Mittel</option>
              <option value="4">4 – Schwer</option>
              <option value="5">5 – Sehr schwer</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="priorKnowledge">Vorwissen (1 = wenig, 5 = viel)</Label>
            <select id="priorKnowledge" name="priorKnowledge" className={selectClass} value={form.priorKnowledge} onChange={handleChange}>
              <option value="1">1 – Kaum Vorwissen</option>
              <option value="2">2 – Wenig Vorwissen</option>
              <option value="3">3 – Mittleres Vorwissen</option>
              <option value="4">4 – Gutes Vorwissen</option>
              <option value="5">5 – Sehr gutes Vorwissen</option>
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pages">Anzahl Seiten / Folien</Label>
            <Input
              id="pages"
              name="pages"
              type="number"
              min={1}
              placeholder="z.B. 120"
              required
              value={form.pages}
              onChange={handleChange}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="credits">ECTS-Punkte der Klausur</Label>
            <Input
              id="credits"
              name="credits"
              type="number"
              min={1}
              max={10}
              placeholder="z.B. 5"
              required
              value={form.credits}
              onChange={handleChange}
            />
          </div>

          <Button type="submit" className="mt-2">
            <Calculator className="w-4 h-4" />
            Lernplan berechnen
          </Button>
        </form>

        {/* Ergebnis */}
        {result ? (
          <div className="flex flex-col gap-4 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            {/* Plantyp-Badge */}
            <div className={cn(
              "flex items-center gap-3 rounded-xl p-4",
              result.planType === "normal" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
            )}>
              {result.planType === "normal"
                ? <CheckCircle className="w-6 h-6 text-green-600 shrink-0" />
                : <AlertTriangle className="w-6 h-6 text-red-600 shrink-0" />
              }
              <div>
                <p className={cn("font-bold text-lg", result.planType === "normal" ? "text-green-700" : "text-red-700")}>
                  {result.planType === "normal" ? "Normaler Lernplan" : "Kritischer Lernplan"}
                </p>
                <p className="text-sm text-gray-500">
                  {result.planType === "normal"
                    ? "Du hast ausreichend Zeit – nachhaltiges Lernen ist möglich."
                    : "Du musst dich ranhalten – Fokus auf das Wesentliche!"}
                </p>
              </div>
            </div>

            {/* Kennzahlen */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Gesamtstunden", value: `${result.totalHours} h` },
                { label: "Geplant/Tag", value: `${plannedHoursPerDay} h` },
                { label: "Tage bis Klausur", value: `${result.daysUntilDeadline}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center justify-center rounded-xl bg-gray-50 border border-gray-200 p-3 text-center">
                  <span className="text-xl font-bold text-gray-900">{value}</span>
                  <span className="text-xs text-gray-500 mt-1">{label}</span>
                </div>
              ))}
            </div>

            {result.planType === "kritisch" ? (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                Rechnerisch wären {result.hoursPerDay} h pro Tag nötig. Der kritische Plan zeigt maximal{" "}
                {CRITICAL_STUDY_HOURS_PER_DAY} h pro Tag und priorisiert die wichtigsten Inhalte.
              </div>
            ) : null}

            {/* Faktoren */}
            <div className="rounded-xl bg-gray-50 border border-gray-200 p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Berechnete Faktoren</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[
                  { label: "D (Deadline)", value: result.deadlineFactor },
                  { label: "S (Schwierigkeit)", value: result.difficultyFactor },
                  { label: "V (Vorwissen)", value: result.knowledgeFactor },
                  { label: "W (Volumen)", value: result.volumeFactor },
                  { label: "C (Credits)", value: result.creditFactor },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <span className="text-gray-500">{label}</span>
                    <span className="font-semibold text-gray-800">{value}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-gray-400">
                Formel: 25 × {result.deadlineFactor} × (({result.difficultyFactor} + {result.volumeFactor} + {result.knowledgeFactor} + {result.creditFactor}) / 4) = <strong>{result.totalHours} h</strong>
              </p>
            </div>

            {/* Phasen */}
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Lernphasen</p>
              {result.phases.map((phase) => (
                <div key={phase.name} className="rounded-xl border border-gray-200 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-800">{phase.name}</span>
                    <span className="text-sm font-bold text-brand-red">{phase.hours} h</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mb-2">
                    <div
                      className="bg-brand-red h-1.5 rounded-full"
                      style={{ width: `${phase.percentage}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500">{phase.description}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 bg-gray-50 gap-3 p-12">
            <Calculator className="w-10 h-10 text-gray-300" />
            <p className="text-sm text-gray-400 text-center">
              Fülle das Formular aus und klicke auf „Lernplan berechnen“
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

