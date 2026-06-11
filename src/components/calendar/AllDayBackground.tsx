import type { CalEvent } from "./events";
import { eventOverlapsDay } from "./events";

interface AllDayBackgroundProps {
  day: Date;
  events: CalEvent[];
}

export function AllDayBackground({ day, events }: AllDayBackgroundProps) {
  const allDayEvents = events.filter(
    (event) => event.allDay && eventOverlapsDay(event, day),
  );

  if (allDayEvents.length === 0) return null;

  return (
    <div className="pointer-events-none absolute inset-0 z-[5] overflow-hidden">
      {allDayEvents.map((event) => (
        <div
          key={event.id}
          className={`absolute inset-0 ${event.color} opacity-[0.07]`}
        />
      ))}
    </div>
  );
}
