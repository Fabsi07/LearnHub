"use client";

import { useRef, useState } from "react";
import { CircleCheckBig, Star } from "lucide-react";
import {
  CalEvent,
  DAY_START_HOUR,
  DAY_END_HOUR,
  HOUR_HEIGHT,
  SNAP_MIN,
  MIN_EVENT_MIN,
  dateToTop,
  durationToHeight,
  formatTime,
  snapMinutes,
  overlapsAnyDhbwEvent,
} from "./events";

interface EventBlockProps {
  event: CalEvent;
  onChange: (next: CalEvent) => void;
  /** Wenn gesetzt, ist horizontales Verschieben (Tageswechsel) aktiv. */
  dayWidth?: number;
  /** Spalten-Layout für überlappende Events. */
  column?: number;
  columns?: number;
  /** DHBW-Events, in die nicht verschoben/vergrößert werden darf. */
  blockedEvents?: CalEvent[];
  /** Wird aufgerufen wenn der Nutzer auf das Event klickt (kein Drag). */
  onEventClick?: (event: CalEvent) => void;
}

type DragMode = "move" | "resize-top" | "resize-bottom";
const DAY_MS = 24 * 60 * 60 * 1000;
const MIN_HEIGHT = (MIN_EVENT_MIN / 60) * HOUR_HEIGHT;
const TOTAL_HEIGHT = (DAY_END_HOUR - DAY_START_HOUR) * HOUR_HEIGHT;

type DragState = {
  mode: DragMode;
  startX: number;
  startY: number;
  origStart: Date;
  origEnd: Date;
};

type Preview = {
  top: number;
  height: number;
  /** Horizontale Verschiebung in px (Tageswechsel-Vorschau). */
  translateX: number;
};

export function EventBlock({
  event,
  onChange,
  dayWidth,
  column = 0,
  columns = 1,
  blockedEvents = [],
  onEventClick,
}: EventBlockProps) {
  const dragRef = useRef<DragState | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  // Tracking ob es ein echter Drag war (> 5px Bewegung)
  const didDragRef = useRef(false);

  const baseTop = dateToTop(event.start);
  const baseHeight = Math.max(
    MIN_HEIGHT,
    durationToHeight(event.start.getTime(), event.end.getTime())
  );

  // Spalten-Layout: kleiner Inset, damit benachbarte Blöcke optisch getrennt sind
  const widthPct = 100 / Math.max(1, columns);
  const leftPct = column * widthPct;
  const isDragging = preview !== null;

  function pxToMinutes(px: number) {
    return (px / HOUR_HEIGHT) * 60;
  }

  function clampTopHeight(top: number, height: number) {
    let t = top;
    let h = Math.max(MIN_HEIGHT, height);
    if (t < 0) t = 0;
    if (t + h > TOTAL_HEIGHT) t = TOTAL_HEIGHT - h;
    return { top: t, height: h };
  }

  function onPointerDown(e: React.PointerEvent, mode: DragMode) {
    if (event.readOnly) return;
    e.stopPropagation();
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    didDragRef.current = false;
    dragRef.current = {
      mode,
      startX: e.clientX,
      startY: e.clientY,
      origStart: new Date(event.start),
      origEnd: new Date(event.end),
    };
    setPreview({ top: baseTop, height: baseHeight, translateX: 0 });
  }

  function onPointerMove(e: React.PointerEvent) {
    const drag = dragRef.current;
    if (!drag) return;
    const deltaY = e.clientY - drag.startY;
    const deltaX = e.clientX - drag.startX;

    // Als Drag markieren sobald Bewegung > 5px
    if (!didDragRef.current && (Math.abs(deltaY) > 5 || Math.abs(deltaX) > 5)) {
      didDragRef.current = true;
    }

    if (drag.mode === "move") {
      // Vertikal: pixelgenaue Vorschau (kein Snap → flüssig)
      const next = clampTopHeight(baseTop + deltaY, baseHeight);
      // Horizontal: an Tagesspalten snappen
      const deltaDays =
        dayWidth && dayWidth > 0 ? Math.round(deltaX / dayWidth) : 0;
      setPreview({
        top: next.top,
        height: next.height,
        translateX: deltaDays * (dayWidth ?? 0),
      });
    } else if (drag.mode === "resize-top") {
      const newTop = baseTop + deltaY;
      const bottom = baseTop + baseHeight;
      const top = Math.min(newTop, bottom - MIN_HEIGHT);
      const clamped = clampTopHeight(top, bottom - top);
      setPreview({ top: clamped.top, height: clamped.height, translateX: 0 });
    } else if (drag.mode === "resize-bottom") {
      const newHeight = Math.max(MIN_HEIGHT, baseHeight + deltaY);
      const clamped = clampTopHeight(baseTop, newHeight);
      setPreview({ top: clamped.top, height: clamped.height, translateX: 0 });
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) {
      setPreview(null);
      return;
    }

    // Kein echter Drag → Click-Handler nur beim "move"-Bereich (nicht bei Resize-Handles) aufrufen
    if (drag.mode === "move" && !didDragRef.current) {
      setPreview(null);
      onEventClick?.(event);
      return;
    }

    const deltaY = e.clientY - drag.startY;
    const deltaX = e.clientX - drag.startX;
    const deltaMin = snapMinutes(pxToMinutes(deltaY));
    const minLen = MIN_EVENT_MIN * 60000;

    if (drag.mode === "move") {
      const deltaDays =
        dayWidth && dayWidth > 0 ? Math.round(deltaX / dayWidth) : 0;
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
        newStart !== event.start.getTime() ||
        newEnd !== event.end.getTime()
      ) {
        if (overlapsAnyDhbwEvent(new Date(newStart), new Date(newEnd), blockedEvents)) {
          setPreview(null);
          return;
        }
        onChange({
          ...event,
          start: new Date(newStart),
          end: new Date(newEnd),
        });
      }
    } else if (drag.mode === "resize-top") {
      const dayMin = new Date(drag.origStart);
      dayMin.setHours(DAY_START_HOUR, 0, 0, 0);
      let newStart = drag.origStart.getTime() + deltaMin * 60000;
      if (newStart < dayMin.getTime()) newStart = dayMin.getTime();
      if (newStart > drag.origEnd.getTime() - minLen) {
        newStart = drag.origEnd.getTime() - minLen;
      }
      if (newStart !== event.start.getTime()) {
        if (overlapsAnyDhbwEvent(new Date(newStart), event.end, blockedEvents)) {
          setPreview(null);
          return;
        }
        onChange({ ...event, start: new Date(newStart) });
      }
    } else if (drag.mode === "resize-bottom") {
      const dayMax = new Date(drag.origEnd);
      dayMax.setHours(DAY_END_HOUR, 0, 0, 0);
      let newEnd = drag.origEnd.getTime() + deltaMin * 60000;
      if (newEnd > dayMax.getTime()) newEnd = dayMax.getTime();
      if (newEnd < drag.origStart.getTime() + minLen) {
        newEnd = drag.origStart.getTime() + minLen;
      }
      if (newEnd !== event.end.getTime()) {
        if (overlapsAnyDhbwEvent(event.start, new Date(newEnd), blockedEvents)) {
          setPreview(null);
          return;
        }
        onChange({ ...event, end: new Date(newEnd) });
      }
    }

    setPreview(null);
  }

  const renderTop = preview?.top ?? baseTop;
  const renderHeight = preview?.height ?? baseHeight;
  const renderTranslateX = preview?.translateX ?? 0;
  const isReadOnly = !!event.readOnly;

  return (
    <div
      onMouseDown={(e) => e.stopPropagation()}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      className={`absolute rounded-md ${event.color} text-white text-xs shadow-sm select-none flex flex-col z-10 ${
        isDragging
          ? "shadow-lg opacity-95 z-20"
          : "transition-[top,height,left,width] duration-150 ease-out"
      } ${isReadOnly ? "ring-1 ring-white/30 opacity-95" : ""} ${
        event.important ? "ring-2 ring-amber-300 ring-offset-1" : ""
      } ${event.taskCompleted ? "opacity-60" : ""}`}
      style={{
        top: renderTop,
        height: renderHeight,
        left: `calc(${leftPct}% + 2px)`,
        width: `calc(${widthPct}% - 4px)`,
        transform: renderTranslateX !== 0 ? `translateX(${renderTranslateX}px)` : undefined,
        transition: isDragging ? "none" : undefined,
        overflow: "visible",
      }}
    >
      <div
        onPointerDown={(e) => onPointerDown(e, "move")}
        onClick={isReadOnly ? () => onEventClick?.(event) : undefined}
        className={`absolute inset-0 rounded-md overflow-hidden px-2 py-1 ${
          isReadOnly ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
        }`}
      >
        <div className="flex items-center gap-1 font-semibold leading-tight">
          {event.important && (
            <Star className="h-3 w-3 shrink-0" fill="currentColor" />
          )}
          {event.taskCompleted && (
            <CircleCheckBig className="h-3 w-3 shrink-0" />
          )}
          <span className={`truncate ${event.taskCompleted ? "line-through" : ""}`}>
            {event.title}
          </span>
        </div>
        <div className="opacity-90 leading-tight truncate">
          {formatTime(event.start)} – {formatTime(event.end)}
          {event.location ? ` · ${event.location}` : ""}
        </div>
      </div>

      {!isReadOnly && (
        <>
          <div
            onPointerDown={(e) => onPointerDown(e, "resize-top")}
            className="absolute left-0 right-0 cursor-ns-resize z-20 group"
            style={{ top: -4, height: 12 }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-8 rounded-full bg-white/0 group-hover:bg-white/60 transition-colors" />
          </div>
          <div
            onPointerDown={(e) => onPointerDown(e, "resize-bottom")}
            className="absolute left-0 right-0 cursor-ns-resize z-20 group"
            style={{ bottom: -4, height: 12 }}
          >
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-1 w-8 rounded-full bg-white/0 group-hover:bg-white/60 transition-colors" />
          </div>
        </>
      )}
    </div>
  );
}
