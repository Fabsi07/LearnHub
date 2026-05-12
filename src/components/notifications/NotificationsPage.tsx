"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Bell,
  BookOpen,
  Clock,
  CheckCircle,
  MoreHorizontal,
  Search,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Notification = {
  id: number;
  type: "assignment" | "exam";
  subject: string;
  course: string;
  dueDate: string;
  description: string;
  isUrgent: boolean;
  isDone: boolean;
};

const notifications: Notification[] = [
  {
    id: 1,
    type: "assignment",
    subject: "Hausarbeit Mathematik",
    course: "Mathematik",
    dueDate: "09. Mai 2026",
    description: "Abgabe der Hausarbeit zum Thema Differentialrechnung bis 23:59 Uhr",
    isUrgent: true,
    isDone: false,
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
  },
];

const filters = ["Alle", "Ungelesen", "Abgaben", "Klausuren"];

export function NotificationsPage() {
  const [selectedId, setSelectedId] = useState(notifications[0].id);
  const [activeFilter, setActiveFilter] = useState(filters[0]);

  const filteredNotifications = useMemo(() => {
    switch (activeFilter) {
      case "Abgaben":
        return notifications.filter((n) => n.type === "assignment");
      case "Klausuren":
        return notifications.filter((n) => n.type === "exam");
      case "Ungelesen":
        return notifications.filter((n) => !n.isDone);
      default:
        return notifications;
    }
  }, [activeFilter]);

  const selectedNotification = useMemo(
    () => filteredNotifications.find((n) => n.id === selectedId) ?? filteredNotifications[0],
    [selectedId, filteredNotifications],
  );

  const getTypeIcon = (type: "assignment" | "exam") => {
    return type === "exam" ? (
      <AlertCircle className="h-5 w-5" />
    ) : (
      <BookOpen className="h-5 w-5" />
    );
  };

  const getTypeLabel = (type: "assignment" | "exam") => {
    return type === "exam" ? "Klausur" : "Abgabe";
  };

  return (
    <div className="flex h-full min-h-[calc(100vh-116px)] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white">
      <header className="flex flex-col gap-4 border-b border-gray-200 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">Benachrichtigungen</p>
          <h1 className="text-2xl font-bold text-gray-900">Übersicht</h1>
        </div>

        <div className="flex h-10 items-center gap-2 rounded-xl bg-gray-100 px-3 text-gray-500 sm:w-72">
          <Search className="h-4 w-4" />
          <span className="text-sm">Benachrichtigungen suchen</span>
        </div>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-r lg:border-b-0">
          <div className="border-b border-gray-200 px-4 py-3">
            <div className="flex gap-1 rounded-xl bg-gray-100 p-1">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={cn(
                    "flex-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                    activeFilter === filter
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700",
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {filteredNotifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => setSelectedId(notification.id)}
                className={cn(
                  "flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition-colors hover:bg-gray-50",
                  selectedId === notification.id && "bg-gray-50",
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
                      <p className="truncate text-sm font-semibold text-gray-900">{notification.subject}</p>
                      <p className="truncate text-xs text-gray-500">{notification.course}</p>
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
            ))}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-[#f8f8f8]">
          {selectedNotification && (
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
                    <h2 className="truncate text-lg font-bold text-gray-900">{selectedNotification.subject}</h2>
                    <p className="truncate text-sm text-gray-500">
                      {selectedNotification.course} • {getTypeLabel(selectedNotification.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <button className="rounded-lg p-2 transition-colors hover:bg-gray-100" aria-label="Archivieren">
                    <Archive className="h-4 w-4" />
                  </button>
                  <button className="rounded-lg p-2 transition-colors hover:bg-gray-100" aria-label="Mehr Optionen">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-auto space-y-6 px-6 py-6">
                <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-600 mb-2">Beschreibung</h3>
                      <p className="text-gray-800">{selectedNotification.description}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Fällig am</p>
                          <p className="text-lg font-bold text-gray-900 mt-1">{selectedNotification.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-gray-500 uppercase">Status</p>
                          <p className={cn(
                            "text-lg font-bold mt-1",
                            selectedNotification.isDone ? "text-green-600" : selectedNotification.isUrgent ? "text-[#ef233c]" : "text-yellow-600"
                          )}>
                            {selectedNotification.isDone ? "Erledigt" : selectedNotification.isUrgent ? "Dringend" : "Offen"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
