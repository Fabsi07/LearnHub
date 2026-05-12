"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  ArchiveRestore,
  BookOpen,
  CheckCircle,
  MoreHorizontal,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = "assignment" | "exam";

type Notification = {
  id: number;
  type: NotificationType;
  subject: string;
  course: string;
  dueDate: string;
  description: string;
  isUrgent: boolean;
  isDone: boolean;
  isArchived: boolean;
};

// NOTE: Mock-Daten – werden später durch /api/notifications ersetzt.
const initialNotifications: Notification[] = [
  {
    id: 1,
    type: "assignment",
    subject: "Hausarbeit Mathematik",
    course: "Mathematik",
    dueDate: "09. Mai 2026",
    description: "Abgabe der Hausarbeit zum Thema Differentialrechnung bis 23:59 Uhr",
    isUrgent: true,
    isDone: false,
    isArchived: false,
  },
  {
    id: 2,
    type: "exam",
    subject: "Klausur Web Engineering",
    course: "Web Engineering",
    dueDate: "15. Mai 2026",
    description: "Prüfung in Hörsaal 201, 10:00 - 12:00 Uhr",
    isUrgent: true,
    isDone: false,
    isArchived: false,
  },
  {
    id: 3,
    type: "assignment",
    subject: "Projekt-Abgabe",
    course: "Softwareentwicklung",
    dueDate: "12. Mai 2026",
    description: "Abgabe des Gruppenprojekts über das Portal",
    isUrgent: false,
    isDone: false,
    isArchived: false,
  },
  {
    id: 4,
    type: "exam",
    subject: "Klausur BWL",
    course: "Betriebswirtschaftslehre",
    dueDate: "18. Mai 2026",
    description: "Prüfung in Hörsaal 105, 14:00 - 16:00 Uhr",
    isUrgent: false,
    isDone: false,
    isArchived: false,
  },
  {
    id: 5,
    type: "assignment",
    subject: "Übungsaufgaben Blatt 5",
    course: "Mathematik",
    dueDate: "07. Mai 2026",
    description: "Abgabe der Lösungen bis zum Beginn der nächsten Vorlesung",
    isUrgent: false,
    isDone: true,
    isArchived: false,
  },
];

const filters = ["Alle", "Offen", "Abgaben", "Klausuren", "Archiviert"] as const;
type Filter = (typeof filters)[number];

export function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(initialNotifications);
  const [activeFilter, setActiveFilter] = useState<Filter>("Alle");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(
    initialNotifications[0]?.id ?? null,
  );

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items
      .filter((n) => {
        switch (activeFilter) {
          case "Abgaben":
            return n.type === "assignment" && !n.isArchived;
          case "Klausuren":
            return n.type === "exam" && !n.isArchived;
          case "Offen":
            return !n.isDone && !n.isArchived;
          case "Archiviert":
            return n.isArchived;
          default:
            return !n.isArchived;
        }
      })
      .filter((n) => {
        if (!term) return true;
        return (
          n.subject.toLowerCase().includes(term) ||
          n.course.toLowerCase().includes(term) ||
          n.description.toLowerCase().includes(term)
        );
      });
  }, [items, activeFilter, searchTerm]);

  // N-5 Fix: Wenn die aktuelle Auswahl im neuen Filter nicht mehr enthalten ist,
  // automatisch den ersten Eintrag selektieren.
  useEffect(() => {
    if (filteredNotifications.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filteredNotifications.some((n) => n.id === selectedId)) {
      setSelectedId(filteredNotifications[0].id);
    }
  }, [filteredNotifications, selectedId]);

  const selectedNotification = useMemo(
    () => filteredNotifications.find((n) => n.id === selectedId) ?? null,
    [selectedId, filteredNotifications],
  );

  const toggleDone = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isDone: !n.isDone } : n)),
    );
  };

  const toggleArchived = (id: number) => {
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isArchived: !n.isArchived } : n)),
    );
  };

  const getTypeIcon = (type: NotificationType) =>
    type === "exam" ? (
      <AlertCircle className="h-5 w-5" />
    ) : (
      <BookOpen className="h-5 w-5" />
    );

  const getTypeLabel = (type: NotificationType) =>
    type === "exam" ? "Klausur" : "Abgabe";

  return (
    <div className="flex h-full min-h-[calc(100vh-116px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Benachrichtigungen</p>
          <h1 className="text-2xl font-bold text-gray-900">Übersicht</h1>
        </div>

        <label className="flex h-10 items-center gap-2 rounded-xl bg-gray-100 px-3 text-gray-500 sm:w-72">
          <Search className="h-4 w-4" />
          <span className="sr-only">Benachrichtigungen suchen</span>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Benachrichtigungen suchen"
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none"
          />
        </label>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-r lg:border-b-0">
          <div className="border-b border-gray-200 px-4 py-3">
            <div role="tablist" aria-label="Filter" className="flex gap-1 rounded-xl bg-gray-100 p-1">
              {filters.map((filter) => {
                const isActive = activeFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    role="tab"
                    aria-selected={isActive}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700",
                    )}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {filteredNotifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Keine Benachrichtigungen gefunden.
              </p>
            ) : (
              filteredNotifications.map((notification) => {
                const isSelected = selectedId === notification.id;
                return (
                  <button
                    key={notification.id}
                    type="button"
                    aria-current={isSelected ? "true" : undefined}
                    onClick={() => setSelectedId(notification.id)}
                    className={cn(
                      "flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition-colors hover:bg-gray-50",
                      isSelected && "bg-gray-50",
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-white",
                        notification.isUrgent ? "bg-[#ef233c]" : "bg-[#5f6a70]",
                      )}
                    >
                      {getTypeIcon(notification.type)}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-gray-900">
                            {notification.subject}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {notification.course}
                          </p>
                        </div>
                        {notification.isDone && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-gray-800">
                        Fällig: {notification.dueDate}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#f8f8f8]">
          {selectedNotification ? (
            <>
              <div className="flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div
                    className={cn(
                      "flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white",
                      selectedNotification.isUrgent ? "bg-[#ef233c]" : "bg-[#5f6a70]",
                    )}
                  >
                    {getTypeIcon(selectedNotification.type)}
                  </div>
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold text-gray-900">
                      {selectedNotification.subject}
                    </h2>
                    <p className="truncate text-sm text-gray-500">
                      {selectedNotification.course} • {getTypeLabel(selectedNotification.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    onClick={() => toggleDone(selectedNotification.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    aria-label={
                      selectedNotification.isDone
                        ? "Als offen markieren"
                        : "Als erledigt markieren"
                    }
                  >
                    <CheckCircle
                      className={cn(
                        "h-4 w-4",
                        selectedNotification.isDone && "text-green-600",
                      )}
                    />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleArchived(selectedNotification.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    aria-label={
                      selectedNotification.isArchived ? "Wiederherstellen" : "Archivieren"
                    }
                  >
                    {selectedNotification.isArchived ? (
                      <ArchiveRestore className="h-4 w-4" />
                    ) : (
                      <Archive className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    type="button"
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100"
                    aria-label="Mehr Optionen"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-auto px-6 py-6">
                <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-600">Beschreibung</h3>
                      <p className="text-gray-800">{selectedNotification.description}</p>
                    </div>

                    <div className="border-t border-gray-200 pt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-500">Fällig am</p>
                          <p className="mt-1 text-lg font-bold text-gray-900">
                            {selectedNotification.dueDate}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-500">Status</p>
                          <p
                            className={cn(
                              "mt-1 text-lg font-bold",
                              selectedNotification.isDone
                                ? "text-green-600"
                                : selectedNotification.isUrgent
                                  ? "text-[#ef233c]"
                                  : "text-yellow-600",
                            )}
                          >
                            {selectedNotification.isDone
                              ? "Erledigt"
                              : selectedNotification.isUrgent
                                ? "Dringend"
                                : "Offen"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-1 items-center justify-center p-6 text-sm text-gray-500">
              Wähle eine Benachrichtigung aus der Liste aus.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
