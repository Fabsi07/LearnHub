"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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
  const [hiddenSubjects, setHiddenSubjects] = useState<Set<string>>(
    () => new Set(),
  );
  const [modal, setModal] = useState<ModalState>({ open: false });
  const localEventsRef = useRef(localEvents);
  localEventsRef.current = localEvents;

  const {
    events: externalEvents,
    loading: externalLoading,
    error: externalError,
    refresh: refreshExternal,
  } = useExternalEvents();

  const subjectOptions = useMemo(
    () =>
      Array.from(
        new Set(
          localEvents
            .map((event) => event.subject?.trim())
            .filter((subject): subject is string => !!subject),
        ),
      ).sort((left, right) => left.localeCompare(right, "de")),
    [localEvents],
  );
  const typeOptions = useMemo(
    () =>
      Array.from(
        new Set(
          localEvents
            .map((event) => event.type?.trim())
            .filter((type): type is string => !!type),
        ),
      ).sort((left, right) => left.localeCompare(right, "de")),
    [localEvents],
  );
  const typeColors = useMemo(
    () =>
      Object.fromEntries(
        localEvents
          .filter((event) => event.type?.trim())
          .map((event) => [event.type!.trim(), event.color]),
      ),
    [localEvents],
  );

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

  function toggleSubject(subject: string) {
    setHiddenSubjects((current) => {
      const next = new Set(current);
      if (next.has(subject)) next.delete(subject);
      else next.add(subject);
      return next;
    });
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
          typeColor: ev.color,
          location: ev.location,
          notes: ev.notes,
          tasks: ev.tasks,
          subject: ev.subject,
          important: ev.important ?? false,
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
    const changed = newEvents.filter((ne) => {
      const old = prev.find((e) => e.id === ne.id);
      return (
        old &&
        (old.start.getTime() !== ne.start.getTime() ||
          old.end.getTime() !== ne.end.getTime() ||
          old.title !== ne.title ||
          (old.allDay ?? false) !== (ne.allDay ?? false) ||
          (old.type ?? null) !== (ne.type ?? null) ||
          old.color !== ne.color ||
          (old.location ?? null) !== (ne.location ?? null) ||
          (old.notes ?? null) !== (ne.notes ?? null) ||
          (old.tasks ?? null) !== (ne.tasks ?? null) ||
          (old.subject ?? null) !== (ne.subject ?? null) ||
          (old.important ?? false) !== (ne.important ?? false) ||
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
    changed
      .filter((event) => !event.id.startsWith("local-"))
      .forEach((event) => {
        const old = prev.find((e) => e.id === event.id);
        const payload: Record<string, unknown> = {
          title: event.title,
          start: event.start.toISOString(),
          end: event.end.toISOString(),
          allDay: event.allDay ?? false,
          type: event.type,
          location: event.location,
          notes: event.notes,
          tasks: event.tasks,
          subject: event.subject,
          important: event.important ?? false,
          repeat: event.repeat ?? "none",
        };

        if (old?.color !== event.color) {
          payload.typeColor = event.color;
        }

        fetch(`/api/calendar/events/${event.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }).catch(() => {
          /* Update gescheitert, UI-State bleibt */
        });
      });
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
          hiddenSubjects={hiddenSubjects}
          typeOptions={typeOptions}
          typeColors={typeColors}
          subjectOptions={subjectOptions}
        />
      </div>

      {/* Kalender-Seitenleiste (rechts) */}
      <CalendarSidebar
        onNewEvent={() => openModal()}
        subjects={subjectOptions}
        eventTypes={typeOptions}
        typeColors={typeColors}
        hiddenSubjects={hiddenSubjects}
        onToggleSubject={toggleSubject}
      />

      <NewEventModal
        open={modal.open}
        onClose={closeModal}
        defaultStart={modal.defaultStart}
        defaultEnd={modal.defaultEnd}
        typeOptions={typeOptions}
        typeColors={typeColors}
        subjectOptions={subjectOptions}
        blockedEvents={externalEvents}
        onCreate={handleCreate}
      />
    </div>
  );
}
