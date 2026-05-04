"use client";

import { WEEKDAYS, getMonthGrid, isSameDay } from "./utils";

interface MonthViewProps {
  currentDate: Date;
}

export function MonthView({ currentDate }: MonthViewProps) {
  const days = getMonthGrid(currentDate);
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="flex flex-col h-full">
      {/* Wochentage Header */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {WEEKDAYS.map((wd) => (
          <div
            key={wd}
            className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 text-center"
          >
            {wd}
          </div>
        ))}
      </div>

      {/* Tage Grid (6 Wochen × 7 Tage) */}
      <div className="grid grid-cols-7 grid-rows-6 flex-1">
        {days.map((day, i) => {
          const isCurrentMonth = day.getMonth() === currentMonth;
          const isToday = isSameDay(day, today);
          return (
            <div
              key={i}
              className={`border-r border-b border-gray-200 p-2 min-h-[90px] flex flex-col gap-1 transition-colors hover:bg-gray-50 cursor-pointer ${
                isCurrentMonth ? "bg-white" : "bg-gray-50/50"
              }`}
            >
              <div className="flex justify-end">
                <span
                  className={`inline-flex items-center justify-center text-sm rounded-full w-7 h-7 ${
                    isToday
                      ? "bg-brand-red text-white font-bold"
                      : isCurrentMonth
                      ? "text-gray-900"
                      : "text-gray-400"
                  }`}
                >
                  {day.getDate()}
                </span>
              </div>
              {/* Platz für Events */}
            </div>
          );
        })}
      </div>
    </div>
  );
}
