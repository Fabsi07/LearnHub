"use client";

import { useEffect, useState } from "react";
import {
  DAY_END_HOUR,
  DAY_START_HOUR,
  dateToTop,
} from "./events";
import { isSameDay } from "./utils";

interface CurrentTimeIndicatorProps {
  day: Date;
  dayIndex?: number;
  dayCount?: number;
}

export function CurrentTimeIndicator({
  day,
  dayIndex,
  dayCount = 1,
}: CurrentTimeIndicatorProps) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    function updateNow() {
      setNow(new Date());
    }

    updateNow();
    const interval = window.setInterval(updateNow, 30_000);
    return () => window.clearInterval(interval);
  }, []);

  if (
    !now ||
    !isSameDay(day, now) ||
    now.getHours() < DAY_START_HOUR ||
    now.getHours() >= DAY_END_HOUR
  ) {
    return null;
  }

  const index = dayIndex ?? 0;
  const startPercent = (index / dayCount) * 100;
  const widthPercent = 100 / dayCount;

  return (
    <div
      className="pointer-events-none absolute left-16 right-0 z-30"
      style={{ top: dateToTop(now) }}
      aria-hidden="true"
    >
      {index > 0 && (
        <span
          className="absolute left-0 top-0 border-t border-dashed border-violet-800/45"
          style={{
            width: `${startPercent}%`,
          }}
        />
      )}
      <span
        className="absolute top-0 h-1 -translate-y-1/2 rounded-full bg-white/90"
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
        }}
      />
      <span
        className="absolute top-0 h-0.5 -translate-y-1/2 rounded-full bg-violet-800"
        style={{
          left: `${startPercent}%`,
          width: `${widthPercent}%`,
        }}
      />
      <span
        className="absolute top-0 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-violet-800 shadow-sm"
        style={{
          left: `${startPercent}%`,
        }}
      />
    </div>
  );
}
