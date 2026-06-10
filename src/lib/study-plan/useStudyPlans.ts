"use client";

import { useCallback, useEffect, useState } from "react";
import type { StudyPlanSummaryDTO } from "./types";

interface UseStudyPlans {
  plans: StudyPlanSummaryDTO[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/**
 * Lädt die Lernpläne des eingeloggten Users (Übersicht).
 * Kein React Query/SWR – einfacher Fetch-Hook gemäß CLAUDE.md §9.
 */
export function useStudyPlans(): UseStudyPlans {
  const [plans, setPlans] = useState<StudyPlanSummaryDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/study-plan");
      if (!res.ok) throw new Error("Lernpläne konnten nicht geladen werden.");
      const data = (await res.json()) as { studyPlans?: StudyPlanSummaryDTO[] };
      setPlans(data.studyPlans ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unbekannter Fehler.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { plans, loading, error, refresh };
}
