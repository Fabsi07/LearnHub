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
      .then((r) => r.json())
      .then((data) => {
        const events: CalEvent[] = (data.events as Record<string, unknown>[]).map(
          deserializeEvent,
        );
        setLocalEvents(events);
      })
      .catch(() => {/* DB nicht erreichbar → leerer Kalender */});
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
          subject: ev.subject,
          repeat: ev.repeat ?? "none",
        }),
      });
      const data = await res.json();
      // Ersetze temporäre local-ID mit echter DB-ID
      const saved = deserializeEvent(data.event as Record<string, unknown>);
      setLocalEvents((prev) => [...prev, saved]);
    } catch {
      // Fallback: Event nur lokal halten wenn DB nicht erreichbar
      setLocalEvents((prev) => [...prev, ev]);
    }
  }

  async function handleEventsChange(newEvents: CalEvent[]) {
    // Geändertes Event durch Drag-Move/Resize finden und in DB persistieren
    const prev = localEventsRef.current;
    const changed = newEvents.find((ne) => {
      const old = prev.find((e) => e.id === ne.id);
      return (
        old &&
        (old.start.getTime() !== ne.start.getTime() ||
          old.end.getTime() !== ne.end.getTime())
      );
    });

    setLocalEvents(newEvents);

    if (changed && !changed.id.startsWith("local-")) {
      fetch(`/api/calendar/events/${changed.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          start: changed.start.toISOString(),
          end: changed.end.toISOString(),
        }),
      }).catch(() => {/* Drag-Update gescheitert, UI-State bleibt */});
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
