"use client";

import { useCallback, useRef, useState } from "react";
import {
  DAY_START_HOUR,
  HOUR_HEIGHT,
  SNAP_MIN,
  MIN_EVENT_MIN,
} from "./events";

function snap(min: number): number {
  return Math.round(min / SNAP_MIN) * SNAP_MIN;
}

function yToDate(day: Date, y: number, columnHeight: number): Date {
  const clamped = Math.max(0, Math.min(columnHeight, y));
  const totalMin = (clamped / HOUR_HEIGHT) * 60;
  const snapped = snap(totalMin);
  const d = new Date(day);
  d.setHours(DAY_START_HOUR, 0, 0, 0);
  d.setMinutes(snapped);
  return d;
}

type DragState = {
  day: Date;
  startY: number;
  currY: number;
  columnEl: HTMLDivElement;
};

/**
 * Drag-to-Create für Tages-Spalten (DayView, WeekView).
 * Liefert `onColumnMouseDown(e, day)` für jede Spalte sowie ein Preview-Objekt
 * mit den px-Koordinaten des Ghost-Blocks, das aktiv ist, solange der Nutzer
 * zieht. Auf Mouse-Up wird `onRequestCreate({start, end})` aufgerufen.
 */
export function useDragCreate(
  onRequestCreate?: (defaults: { start: Date; end: Date }) => void,
) {
  const [drag, setDrag] = useState<DragState | null>(null);
  const dragRef = useRef<DragState | null>(null);

  const onColumnMouseDown = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, day: Date) => {
      if (e.button !== 0) return;
      if (!onRequestCreate) return;
      const columnEl = e.currentTarget;
      const rect = columnEl.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const state: DragState = { day, startY: y, currY: y, columnEl };
      dragRef.current = state;
      setDrag(state);

      function onMove(ev: MouseEvent) {
        const s = dragRef.current;
        if (!s) return;
        const r = s.columnEl.getBoundingClientRect();
        const ny = ev.clientY - r.top;
        const next: DragState = { ...s, currY: ny };
        dragRef.current = next;
        setDrag(next);
      }

      function onUp() {
        window.removeEventListener("mousemove", onMove);
        window.removeEventListener("mouseup", onUp);
        const s = dragRef.current;
        dragRef.current = null;
        setDrag(null);
        if (!s) return;
        const colHeight = s.columnEl.offsetHeight;
        const a = Math.min(s.startY, s.currY);
        const b = Math.max(s.startY, s.currY);
        const start = yToDate(s.day, a, colHeight);
        let end = yToDate(s.day, b, colHeight);
        const durMin = (end.getTime() - start.getTime()) / 60000;
        if (durMin < MIN_EVENT_MIN) {
          end = new Date(start.getTime() + MIN_EVENT_MIN * 60000);
        }
        onRequestCreate?.({ start, end });
      }

      window.addEventListener("mousemove", onMove);
      window.addEventListener("mouseup", onUp);
    },
    [onRequestCreate],
  );

  const preview = drag
    ? (() => {
        const colHeight = drag.columnEl.offsetHeight;
        const a = Math.max(
          0,
          Math.min(colHeight, Math.min(drag.startY, drag.currY)),
        );
        const b = Math.max(
          0,
          Math.min(colHeight, Math.max(drag.startY, drag.currY)),
        );
        const totalMinA = snap((a / HOUR_HEIGHT) * 60);
        const totalMinB = snap((b / HOUR_HEIGHT) * 60);
        const top = (totalMinA / 60) * HOUR_HEIGHT;
        const height = Math.max(
          ((totalMinB - totalMinA) / 60) * HOUR_HEIGHT,
          4,
        );
        const startDate = yToDate(drag.day, a, colHeight);
        const endDate = yToDate(drag.day, b, colHeight);
        return { day: drag.day, top, height, start: startDate, end: endDate };
      })()
    : null;

  return { onColumnMouseDown, preview };
}
