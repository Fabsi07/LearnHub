// Feature-nahe UI-Helfer für die Lernplan-Seiten (Badges, Datumsformate).

import type { GoalType } from "@prisma/client";
import {
  Bookmark,
  FileText,
  GraduationCap,
  Presentation,
  Target,
  type LucideIcon,
} from "lucide-react";

export interface GoalTypeMeta {
  label: string;
  icon: LucideIcon;
  /** Tailwind-Klassen für den Badge (Hintergrund + Text). */
  badgeClass: string;
}

export const GOAL_TYPE_META: Record<GoalType, GoalTypeMeta> = {
  KLAUSUR: {
    label: "Klausur",
    icon: GraduationCap,
    badgeClass: "bg-red-50 text-red-700",
  },
  ABGABE: {
    label: "Abgabe",
    icon: FileText,
    badgeClass: "bg-blue-50 text-blue-700",
  },
  PRAESENTATION: {
    label: "Präsentation",
    icon: Presentation,
    badgeClass: "bg-amber-50 text-amber-700",
  },
  SELBSTLERNZIEL: {
    label: "Selbstlernziel",
    icon: Target,
    badgeClass: "bg-emerald-50 text-emerald-700",
  },
  SONSTIGES: {
    label: "Sonstiges",
    icon: Bookmark,
    badgeClass: "bg-gray-100 text-gray-700",
  },
};

/** ISO-Datum → "DD.MM.YYYY". */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

/** Ganze Tage von heute (Mitternacht) bis zum Datum; negativ = überfällig. */
export function daysUntil(iso: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(iso);
  target.setHours(0, 0, 0, 0);
  return Math.round((target.getTime() - today.getTime()) / 86_400_000);
}

/** "noch X Tage" / "heute" / "überfällig" + passende Textfarbe. */
export function remainingLabel(iso: string): { text: string; className: string } {
  const days = daysUntil(iso);
  if (days < 0) return { text: "überfällig", className: "text-red-600" };
  if (days === 0) return { text: "heute fällig", className: "text-amber-600" };
  if (days === 1) return { text: "noch 1 Tag", className: "text-gray-500" };
  return { text: `noch ${days} Tage`, className: "text-gray-500" };
}

/** Minuten → "1 Std. 30 Min." / "45 Min.". */
export function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h === 0) return `${m} Min.`;
  if (m === 0) return `${h} Std.`;
  return `${h} Std. ${m} Min.`;
}

/** ISO-Datum → Wert für <input type="date"> (lokal, "YYYY-MM-DD"). */
export function toDateInputValue(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** "YYYY-MM-DD" aus einem Date-Input → lokales Date-Objekt (Mitternacht). */
export function fromDateInputValue(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(year, month - 1, day);
}
