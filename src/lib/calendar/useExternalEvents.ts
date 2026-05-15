"use client";

import { useCallback, useEffect, useState } from "react";
import type { CalEvent } from "@/components/calendar/events";

type ApiEvent = Omit<CalEvent, "start" | "end"> & {
  start: string;
  end: string;
};

export function useExternalEvents() {
  const [events, setEvents] = useState<CalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (force = false) => {
    setLoading(true);
    setError(null);
    try {
      const url = force
        ? "/api/calendar/external?force=1"
        : "/api/calendar/external";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = (await res.json()) as { events: ApiEvent[] };
      setEvents(
        data.events.map((e) => ({
          ...e,
          start: new Date(e.start),
          end: new Date(e.end),
        }))
      );
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Initial-Load: darf gerne aus dem Cache kommen.
    refresh(false);
  }, [refresh]);

  return { events, loading, error, refresh };
}
