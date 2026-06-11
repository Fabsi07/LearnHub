"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

interface EditableComboboxProps {
  id: string;
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
}

export function EditableCombobox({
  id,
  label,
  value,
  options,
  placeholder,
  onChange,
}: EditableComboboxProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const normalizedValue = value.trim().toLocaleLowerCase("de-DE");
  const filteredOptions = useMemo(
    () =>
      options.filter((option) =>
        option.toLocaleLowerCase("de-DE").includes(normalizedValue),
      ),
    [normalizedValue, options],
  );
  const isNewValue =
    value.trim().length > 0 &&
    !options.some(
      (option) => option.toLocaleLowerCase("de-DE") === normalizedValue,
    );

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div ref={rootRef} className="relative flex flex-col gap-1">
      <label htmlFor={id} className="text-xs font-semibold text-gray-700">
        {label} <span className="text-brand-red">*</span>
      </label>
      <div className="relative">
        <input
          id={id}
          type="text"
          required
          autoComplete="off"
          value={value}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          placeholder={placeholder}
          className={cn(
            "w-full rounded-lg border border-gray-300 px-3 py-2 pr-9 text-sm focus:border-brand-red focus:outline-none focus:ring-2 focus:ring-brand-red/30",
            value.trim() ? "bg-white" : "bg-gray-100 text-gray-500",
          )}
        />
        <button
          type="button"
          onClick={() => setOpen((current) => !current)}
          className="absolute inset-y-0 right-0 flex w-9 items-center justify-center text-gray-400 hover:text-gray-700"
          aria-label={`${label}-Vorschläge anzeigen`}
          tabIndex={-1}
        >
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      {open && (
        <div className="absolute left-0 right-0 top-full z-30 mt-1 max-h-44 overflow-y-auto rounded-xl border border-gray-200 bg-white p-1.5 shadow-xl">
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => {
                onChange(option);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
            >
              <span>{option}</span>
              {option.toLocaleLowerCase("de-DE") === normalizedValue && (
                <Check className="h-4 w-4 text-brand-red" />
              )}
            </button>
          ))}
          {isNewValue && (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-sm font-medium text-brand-red hover:bg-red-50"
            >
              <Plus className="h-4 w-4" />
              „{value.trim()}“ neu hinzufügen
            </button>
          )}
          {filteredOptions.length === 0 && !isNewValue && (
            <p className="px-2.5 py-2 text-xs text-gray-500">
              Noch keine Einträge vorhanden. Tippe einen neuen Wert ein.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
