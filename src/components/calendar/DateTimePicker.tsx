"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Clock,
} from "lucide-react";
import { getMonthGrid } from "./utils";

interface DateTimePickerProps {
  id: string;
  label: string;
  value: string;
  open: boolean;
  align?: "left" | "right";
  dateOnly?: boolean;
  allowMidnight?: boolean;
  stage?: "start" | "end";
  /** Ersetzt den Standard-Trigger-Button-Style (dunkles Theme). */
  triggerClassName?: string;
  /** Platzhaltertext wenn kein Datum gewählt (value leer). */
  placeholder?: string;
  onOpenChange: (open: boolean) => void;
  onChange: (value: string) => void;
  onComplete?: () => void;
}

const WEEKDAYS = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];
const START_HOURS = Array.from({ length: 17 }, (_, index) => index + 7);
const MINUTE_OPTIONS = [0, 15, 30, 45];
const WHEEL_ITEM_HEIGHT = 40;

interface TimeWheelProps {
  label: string;
  values: number[];
  selected: number;
  onChange: (value: number) => void;
}

function TimeWheel({ label, values, selected, onChange }: TimeWheelProps) {
  const wheelRef = useRef<HTMLDivElement>(null);
  const scrollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const selectedIndex = Math.max(0, values.indexOf(selected));
    wheelRef.current?.scrollTo({
      top: selectedIndex * WHEEL_ITEM_HEIGHT,
      behavior: "smooth",
    });
  }, [selected, values]);

  useEffect(
    () => () => {
      if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    },
    [],
  );

  function handleScroll() {
    if (scrollTimerRef.current) clearTimeout(scrollTimerRef.current);
    scrollTimerRef.current = setTimeout(() => {
      const index = Math.max(
        0,
        Math.min(
          values.length - 1,
          Math.round((wheelRef.current?.scrollTop ?? 0) / WHEEL_ITEM_HEIGHT),
        ),
      );
      onChange(values[index]);
    }, 80);
  }

  return (
    <div className="flex-1">
      <p className="mb-1.5 text-center text-[10px] font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>
      <div className="relative overflow-hidden rounded-xl bg-slate-950">
        <div className="pointer-events-none absolute inset-x-1 top-1/2 z-10 h-10 -translate-y-1/2 rounded-lg border border-slate-600 bg-slate-800/80" />
        <div
          ref={wheelRef}
          onScroll={handleScroll}
          className="relative z-20 h-[120px] snap-y snap-mandatory overflow-y-auto py-10 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {values.map((value) => (
            <button
              key={value}
              type="button"
              onClick={() => onChange(value)}
              className={`flex h-10 w-full snap-center items-center justify-center text-lg font-semibold transition-colors ${
                value === selected ? "text-white" : "text-slate-500"
              }`}
            >
              {value.toString().padStart(2, "0")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function parseLocalValue(value: string): Date {
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

function toLocalInputValue(date: Date): string {
  const pad = (value: number) => value.toString().padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function formatValue(value: string, dateOnly: boolean): string {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    ...(dateOnly ? {} : { hour: "2-digit", minute: "2-digit" }),
  }).format(parseLocalValue(value));
}

function sameDay(left: Date, right: Date): boolean {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
  );
}

export function DateTimePicker({
  id,
  label,
  value,
  open,
  align = "left",
  dateOnly = false,
  allowMidnight = false,
  stage,
  triggerClassName,
  placeholder,
  onOpenChange,
  onChange,
  onComplete,
}: DateTimePickerProps) {
  const selected = parseLocalValue(value);
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(selectedYear, selectedMonth, 1),
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const monthDays = useMemo(() => getMonthGrid(visibleMonth), [visibleMonth]);
  const hourOptions = useMemo(
    () => (allowMidnight ? [...START_HOURS, 0] : START_HOURS),
    [allowMidnight],
  );

  useEffect(() => {
    if (open) {
      setVisibleMonth(new Date(selectedYear, selectedMonth, 1));
    }
  }, [open, selectedYear, selectedMonth]);

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open, onOpenChange]);

  function selectDate(day: Date) {
    const next = new Date(selected);
    next.setFullYear(day.getFullYear(), day.getMonth(), day.getDate());
    onChange(toLocalInputValue(next));
    if (dateOnly) {
      onOpenChange(false);
      onComplete?.();
    }
  }

  function selectHour(hours: number) {
    const next = new Date(selected);
    if (allowMidnight && hours === 0 && selected.getHours() !== 0) {
      next.setDate(next.getDate() + 1);
    } else if (allowMidnight && hours !== 0 && selected.getHours() === 0) {
      next.setDate(next.getDate() - 1);
    }
    next.setHours(hours, hours === 0 ? 0 : selected.getMinutes(), 0, 0);
    onChange(toLocalInputValue(next));
  }

  function selectMinute(minutes: number) {
    const next = new Date(selected);
    next.setMinutes(selected.getHours() === 0 ? 0 : minutes, 0, 0);
    onChange(toLocalInputValue(next));
  }

  function completeTimeSelection() {
    onOpenChange(false);
    onComplete?.();
  }

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700">
        {label}
      </label>
      <button
        id={id}
        type="button"
        onClick={() => onOpenChange(!open)}
        className={
          triggerClassName ??
          "flex w-full items-center gap-2 rounded-xl border border-slate-700 bg-slate-800 px-3 py-2.5 text-left text-sm font-medium text-white shadow-sm transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-red/40"
        }
        aria-expanded={open}
      >
        <CalendarDays className="h-4 w-4 shrink-0 text-red-400" />
        <span className={`truncate ${!value && placeholder ? "text-gray-400" : ""}`}>
          {!value && placeholder ? placeholder : formatValue(value, dateOnly)}
        </span>
      </button>

      {open && (
        <div
          className={`fixed left-1/2 top-1/2 z-[70] max-h-[calc(100vh-2rem)] w-72 max-w-[calc(100vw-2rem)] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-slate-600 bg-slate-900 p-3 text-white shadow-2xl ${
            align === "right" ? "origin-top-right" : "origin-top-left"
          }`}
        >
          {stage && (
            <div className="mb-3">
              <div
                className="flex items-center gap-2"
                aria-label={`Schritt ${stage === "start" ? 1 : 2} von 2`}
              >
                <div
                  className={`flex flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 ${
                    stage === "start"
                      ? "border-red-400/70 bg-red-500/15 text-white"
                      : "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold">
                    {stage === "end" ? <Check className="h-3.5 w-3.5" /> : "1"}
                  </span>
                  <span className="text-xs font-bold">Beginn</span>
                </div>
                <div
                  className={`flex flex-1 items-center gap-2 rounded-xl border px-2.5 py-2 ${
                    stage === "end"
                      ? "border-red-400/70 bg-red-500/15 text-white"
                      : "border-slate-700 bg-slate-800/60 text-slate-500"
                  }`}
                >
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold">
                    2
                  </span>
                  <span className="text-xs font-bold">Ende</span>
                </div>
              </div>
              <p
                className={`mt-2 rounded-lg px-2.5 py-2 text-xs font-medium ${
                  stage === "end"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-slate-800 text-slate-300"
                }`}
              >
                {stage === "start"
                  ? "Wähle Datum und Uhrzeit für den Beginn."
                  : "Beginn übernommen. Wähle jetzt Datum und Uhrzeit für das Ende."}
              </p>
            </div>
          )}

          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() - 1, 1),
                )
              }
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Vorheriger Monat"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-sm font-semibold">
              {new Intl.DateTimeFormat("de-DE", {
                month: "long",
                year: "numeric",
              }).format(visibleMonth)}
            </span>
            <button
              type="button"
              onClick={() =>
                setVisibleMonth(
                  (current) =>
                    new Date(current.getFullYear(), current.getMonth() + 1, 1),
                )
              }
              className="rounded-lg p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white"
              aria-label="Nächster Monat"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((weekday) => (
              <span
                key={weekday}
                className="pb-1 text-[10px] font-semibold uppercase text-slate-500"
              >
                {weekday}
              </span>
            ))}
            {monthDays.map((day) => {
              const isSelected = sameDay(day, selected);
              const isCurrentMonth = day.getMonth() === visibleMonth.getMonth();
              return (
                <button
                  key={day.toISOString()}
                  type="button"
                  onClick={() => selectDate(day)}
                  className={`h-8 rounded-lg text-xs font-medium transition-colors ${
                    isSelected
                      ? "bg-brand-red text-white"
                      : isCurrentMonth
                        ? "text-slate-200 hover:bg-slate-700"
                        : "text-slate-600 hover:bg-slate-800"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>

          {!dateOnly && (
            <>
              <div className="my-3 h-px bg-slate-700" />
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Clock className="h-3.5 w-3.5" />
                Uhrzeit auswählen
              </div>
              <div className="relative flex items-end gap-2">
                <TimeWheel
                  label="Stunde"
                  values={hourOptions}
                  selected={selected.getHours()}
                  onChange={selectHour}
                />
                <span className="pb-[46px] text-xl font-bold text-slate-500">:</span>
                <TimeWheel
                  label="Minute"
                  values={MINUTE_OPTIONS}
                  selected={selected.getHours() === 0 ? 0 : selected.getMinutes()}
                  onChange={selectMinute}
                />
              </div>
              <button
                type="button"
                onClick={completeTimeSelection}
              className="mt-3 w-full rounded-xl bg-brand-red px-3 py-2 text-sm font-bold text-white transition-opacity hover:opacity-90"
            >
                {stage === "start"
                  ? "Beginn übernehmen & Ende wählen"
                  : stage === "end"
                    ? "Ende übernehmen"
                    : "Zeit übernehmen"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
