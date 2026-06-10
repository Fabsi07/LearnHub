"use client";

import { Check } from "lucide-react";
import { TYPE_COLOR_OPTIONS } from "./events";

interface TypeColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

export function TypeColorPicker({ value, onChange }: TypeColorPickerProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs font-semibold text-gray-700">Typ-Farbe</span>
      <div className="flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-gray-50 p-2.5">
        {TYPE_COLOR_OPTIONS.map((option) => {
          const selected = option.className === value;
          return (
            <button
              key={option.className}
              type="button"
              title={option.name}
              aria-label={`${option.name} als Typ-Farbe wählen`}
              aria-pressed={selected}
              onClick={() => onChange(option.className)}
              className={`flex h-7 w-7 items-center justify-center rounded-full ${option.className} transition-transform hover:scale-110 ${
                selected ? "ring-2 ring-gray-900 ring-offset-2" : ""
              }`}
            >
              {selected && <Check className="h-4 w-4 text-white" strokeWidth={3} />}
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500">
        Diese Farbe gilt für alle Events dieses Typs.
      </p>
    </div>
  );
}
