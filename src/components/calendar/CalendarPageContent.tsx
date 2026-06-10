"use client";

import { useEffect, useRef, useState } from "react";
import { Calendar } from "./Calendar";
import { CalendarSidebar } from "./CalendarSidebar";
import { NewEventModal } from "./NewEventModal";
import { CalEvent, RepeatRule } from "./events";
import { useExternalEvents } from "@/lib/calendar/useExternalEvents";

type ModalState = {
  open: boolean;
  defaultStart?: Date;
  defaultEnd?: Date;
};

function deserializeEvent(raw: Record<string, unknown>): CalEvent {
  return {
    ...(raw as Omit<CalEvent, "start" | "end">),
    start: new Date(raw.start as string),
    end: new Date(raw.end as string),
    repeat: (raw.repeat as RepeatRule | undefined) ?? "none",
  };
}

export function CalendarPageContent() {
  const [localEvents, setLocalEvents] = useState<CalEvent[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const localEventsRef = useRef(localEvents);
  localEventsRef.current = localEvents;

  const {
    events: externalEvents,
    loading: externalLoading,
    error: externalError,
    refresh: refreshExternal,
  } = useExternalEvents();

  // Lokale Events beim Start aus der DB laden
  useEffect(() => {
    fetch("/api/calendar/events")
      .then(async (r) => {
        if (!r.ok) throw new Error("Failed to load events");
        const data = (await r.json()) as { events?: Record<string, unknown>[] };
        const events: CalEvent[] = (data.events ?? []).map(deserializeEvent);
        setLocalEvents(events);
      })
      .catch(() => {
        /* DB nicht erreichbar/keine Berechtigung → leerer Kalender */
      });
  }, []);

  function openModal(defaults?: { start?: Date; end?: Date }) {
    setModal({
      open: true,
      defaultStart: defaults?.start,
      defaultEnd: defaults?.end,
    });
  }

  function closeModal() {
    setModal({ open: false });
  }

  async function handleCreate(ev: CalEvent) {
    // Optimistic: sofort im UI anzeigen
    setLocalEvents((prev) => [...prev, ev]);

    try {
      const res = await fetch("/api/calendar/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: ev.title,
          start: ev.start.toISOString(),
          end: ev.end.toISOString(),
          allDay: ev.allDay ?? false,
          type: ev.type,
          location: ev.location,
          notes: ev.notes,
          tasks: ev.tasks,
          subject: ev.subject,
          repeat: ev.repeat ?? "none",
        }),
      });

      const data = (await res.json().catch(() => null)) as
        | { event?: Record<string, unknown>; error?: string }
        | null;

      if (!res.ok || !data?.event) {
        throw new Error(data?.error ?? "Event konnte nicht gespeichert werden.");
      }

      const saved = deserializeEvent(data.event);
      // Ersetze optimistisch eingefügtes local-Event mit der DB-Version (ohne lokale Änderungen zu überschreiben)
      setLocalEvents((prev) =>
        prev.map((e) => (e.id === ev.id ? { ...saved, ...e, id: saved.id } : e)),
      );
    } catch {
      // Fallback: Optimistic-Event bleibt lokal erhalten (DB nicht erreichbar / Fehler)
    }
  }

  async function handleEventsChange(newEvents: CalEvent[]) {
    const prev = localEventsRef.current;

    const removed = prev.filter((e) => !newEvents.some((ne) => ne.id === e.id));
    const changed = newEvents.find((ne) => {
      const old = prev.find((e) => e.id === ne.id);
      return (
        old &&
        (old.start.getTime() !== ne.start.getTime() ||
          old.end.getTime() !== ne.end.getTime() ||
          old.title !== ne.title ||
          (old.allDay ?? false) !== (ne.allDay ?? false) ||
          (old.type ?? null) !== (ne.type ?? null) ||
          (old.location ?? null) !== (ne.location ?? null) ||
          (old.notes ?? null) !== (ne.notes ?? null) ||
          (old.tasks ?? null) !== (ne.tasks ?? null) ||
          (old.subject ?? null) !== (ne.subject ?? null) ||
          (old.repeat ?? "none") !== (ne.repeat ?? "none"))
      );
    });

    setLocalEvents(newEvents);

    // Löschungen persistieren
    removed
      .filter((e) => !e.id.startsWith("local-"))
      .forEach((e) => {
        fetch(`/api/calendar/events/${e.id}`, { method: "DELETE" }).catch(() => {
          /* Delete gescheitert, UI-State bleibt */
        });
      });

    // Änderungen persistieren (Drag + Edit-Modal)
    if (changed && !changed.id.startsWith("local-")) {
      fetch(`/api/calendar/events/${changed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: changed.title,
          start: changed.start.toISOString(),
          end: changed.end.toISOString(),
          allDay: changed.allDay ?? false,
          type: changed.type,
          location: changed.location,
          notes: changed.notes,
          tasks: changed.tasks,
          subject: changed.subject,
          repeat: changed.repeat ?? "none",
        }),
      }).catch(() => {
        /* Update gescheitert, UI-State bleibt */
      });
    }
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* Kalender-Hauptbereich */}
      <div className="flex-1 p-6 overflow-hidden">
        <Calendar
          localEvents={localEvents}
          onLocalEventsChange={handleEventsChange}
          onRequestCreate={openModal}
          externalEvents={externalEvents}
          externalLoading={externalLoading}
          externalError={externalError}
          refreshExternal={refreshExternal}
        />
      </div>

      {/* Kalender-Seitenleiste (rechts) */}
      <CalendarSidebar onNewEvent={() => openModal()} />

      <NewEventModal
        open={modal.open}
        onClose={closeModal}
        defaultStart={modal.defaultStart}
        defaultEnd={modal.defaultEnd}
        blockedEvents={externalEvents}
        onCreate={handleCreate}
      />
    </div>
  );
}
