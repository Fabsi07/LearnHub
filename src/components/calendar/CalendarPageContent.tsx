"use client";

import { useState } from "react";
import { Calendar } from "./Calendar";
import { CalendarSidebar } from "./CalendarSidebar";
import { NewEventModal } from "./NewEventModal";
import { CalEvent } from "./events";
import { useExternalEvents } from "@/lib/calendar/useExternalEvents";

type ModalState = {
  open: boolean;
  defaultStart?: Date;
  defaultEnd?: Date;
};

export function CalendarPageContent() {
  const [localEvents, setLocalEvents] = useState<CalEvent[]>([]);
  const [modal, setModal] = useState<ModalState>({ open: false });
  const {
    events: externalEvents,
    loading: externalLoading,
    error: externalError,
    refresh: refreshExternal,
  } = useExternalEvents();

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

  return (
    <div className="flex h-full overflow-hidden">
      {/* Kalender-Hauptbereich */}
      <div className="flex-1 p-6 overflow-hidden">
        <Calendar
          localEvents={localEvents}
          onLocalEventsChange={setLocalEvents}
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
        onCreate={(ev) => setLocalEvents((prev) => [...prev, ev])}
      />
    </div>
  );
}
