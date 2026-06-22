"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

interface CalendarSearchContextValue {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
}

const CalendarSearchContext =
  createContext<CalendarSearchContextValue | null>(null);

interface CalendarSearchProviderProps {
  children: ReactNode;
}

export function CalendarSearchProvider({
  children,
}: CalendarSearchProviderProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const value = useMemo(
    () => ({ searchQuery, setSearchQuery }),
    [searchQuery],
  );

  return (
    <CalendarSearchContext.Provider value={value}>
      {children}
    </CalendarSearchContext.Provider>
  );
}

export function useCalendarSearch() {
  const context = useContext(CalendarSearchContext);

  if (!context) {
    throw new Error(
      "useCalendarSearch must be used within CalendarSearchProvider",
    );
  }

  return context;
}
