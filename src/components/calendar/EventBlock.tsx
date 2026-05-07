"use client";

import { useRef } from "react";
import {
  CalEvent,
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  SNAP_MIN,
  dateToTop,
  durationToHeight,
  formatTime,
  snapMinutes,
} from "./events";

interface EventBlockProps {
  event: CalEvent;
  onChange: (next: CalEvent) => void;
  /** Wenn gesetzt, ist horizontales Verschieben (Tageswechsel) aktiv. */
  dayWidth?: number;
}

type DragMode = "move" | "resize-top" | "resize-bottom";
const DAY_MS = 24 * 60 * 60 * 1000;

export function EventBlock({ event, onChange, dayWidth }: EventBlockProps) {
  const ref = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: DragMode;
    startX: number;
    startY: number;
    origStart: Date;
    origEnd: Date;
  } | null>(null);

  const top = dateToTop(event.start);
  const height = Math.max(
    18,
    durationToHeight(event.start.getTime(), event.end.getTime())
  );

  function pxToMinutes(px: number) {
    return (px / HOUR_HEIGHT) * 60;
  }

  function onPointerDown(e: React.PointerEvent, mode: DragMode) {
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origStart: new Date(event.start),
      origEnd: new Date(event.end),
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaY = e.clientY - drag.startY;
    const deltaMin = snapMinutes(pxToMinutes(deltaY));

    let deltaDays = 0;
    if (drag.mode === "move" && dayWidth && dayWidth > 0) {
      const deltaX = e.clientX - drag.startX;
      deltaDays = Math.round(deltaX / dayWidth);
    }

    if (drag.mode === "move") {
      let newStart =
        drag.origStart.getTime() + deltaDays * DAY_MS + deltaMin * 60000;
      let newEnd =
        drag.origEnd.getTime() + deltaDays * DAY_MS + deltaMin * 60000;
      const length = newEnd - newStart;

      // Tages-Grenzen relativ zum NEUEN Tag
      const dayMin = new Date(newStart);
      dayMin.setHours(DAY_START_HOUR, 0, 0, 0);
      const dayMax = new Date(newStart);
      dayMax.setHours(DAY_END_HOUR, 0, 0, 0);

      if (newStart < dayMin.getTime()) {
        newStart = dayMin.getTime();
        newEnd = newStart + length;
      }
      if (newEnd > dayMax.getTime()) {
        newEnd = dayMax.getTime();
        newStart = newEnd - length;
      }

      if (
        newStart === event.start.getTime() &&
        newEnd === event.end.getTime()
      ) {
        return;
      }
      onChange({
        ...event,
        start: new Date(newStart),
        end: new Date(newEnd),
      });
    } else if (drag.mode === "resize-top") {
      if (deltaMin === 0) return;
      const dayMin = new Date(drag.origStart);
      dayMin.setHours(DAY_START_HOUR, 0, 0, 0);
      let newStart = drag.origStart.getTime() + deltaMin * 60000;
      const minLen = SNAP_MIN * 60000;
      if (newStart < dayMin.getTime()) newStart = dayMin.getTime();
      if (newStart > drag.origEnd.getTime() - minLen) {
        newStart = drag.origEnd.getTime() - minLen;
      }
      onChange({ ...event, start: new Date(newStart) });
    } else if (drag.mode === "resize-bottom") {
      if (deltaMin === 0) return;
      const dayMax = new Date(drag.origEnd);
      dayMax.setHours(DAY_END_HOUR, 0, 0, 0);
      let newEnd = drag.origEnd.getTime() + deltaMin * 60000;
      const minLen = SNAP_MIN * 60000;
      if (newEnd > dayMax.getTime()) newEnd = dayMax.getTime();
      if (newEnd < drag.origStart.getTime() + minLen) {
        newEnd = drag.origStart.getTime() + minLen;
      }
      onChange({ ...event, end: new Date(newEnd) });
    }
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`absolute left-1 right-1 rounded-md ${event.color} text-white text-xs shadow-sm overflow-hidden select-none flex flex-col z-10`}
      style={{ top, height }}
    >
      <div
        onPointerDown={(e) => onPointerDown(e, "resize-top")}
        className="h-1.5 w-full cursor-ns-resize hover:bg-black/20"
      />
      <div
        onPointerDown={(e) => onPointerDown(e, "move")}
        className="flex-1 px-2 py-1 cursor-grab active:cursor-grabbing"
      >
        <div className="font-semibold leading-tight truncate">{event.title}</div>
        <div className="opacity-90 leading-tight truncate">
          {formatTime(event.start)} – {formatTime(event.end)}
        </div>
      </div>
      <div
        onPointerDown={(e) => onPointerDown(e, "resize-bottom")}
        className="h-1.5 w-full cursor-ns-resize hover:bg-black/20"
      />
    </div>
  );
}
