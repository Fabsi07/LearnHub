"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Archive,
  ArchiveRestore,
  BookOpen,
  CalendarClock,
  CheckCircle,
  Search,
  Trash2,
} from "lucide-react";
import type {
  NotificationDTO,
  NotificationType,
} from "@/lib/notifications/types";
import { cn } from "@/lib/utils";

const filters = ["Alle", "Offen", "Abgaben", "Klausuren", "Lernsessions", "Archiviert"] as const;
type Filter = (typeof filters)[number];

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "long",
  year: "numeric",
});

function formatDate(value: string) {
  return DATE_FORMATTER.format(new Date(value));
}

export function NotificationsPage() {
  const [items, setItems] = useState<NotificationDTO[]>([]);
  const [activeFilter, setActiveFilter] = useState<Filter>("Alle");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadNotifications() {
      try {
        const response = await fetch("/api/notifications", { cache: "no-store" });
        const data = (await response.json().catch(() => ({}))) as {
          notifications?: NotificationDTO[];
          error?: string;
        };

        if (!response.ok) {
          throw new Error(data.error ?? "Benachrichtigungen konnten nicht geladen werden.");
        }

        if (!cancelled) {
          setItems(data.notifications ?? []);
          setError(null);
        }
      } catch (loadError) {
        if (!cancelled) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Benachrichtigungen konnten nicht geladen werden.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadNotifications();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredNotifications = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    return items
      .filter((notification) => {
        switch (activeFilter) {
          case "Abgaben":
            return notification.type === "assignment" && !notification.isArchived;
          case "Klausuren":
            return notification.type === "exam" && !notification.isArchived;
          case "Lernsessions":
            return notification.type === "missed-session" && !notification.isArchived;
          case "Offen":
            return !notification.isDone && !notification.isArchived;
          case "Archiviert":
            return notification.isArchived;
          default:
            return !notification.isArchived;
        }
      })
      .filter((notification) => {
        if (!term) return true;
        return (
          notification.subject.toLowerCase().includes(term) ||
          notification.course.toLowerCase().includes(term) ||
          notification.description.toLowerCase().includes(term)
        );
      });
  }, [items, activeFilter, searchTerm]);

  useEffect(() => {
    if (filteredNotifications.length === 0) {
      setSelectedId(null);
      return;
    }
    if (!filteredNotifications.some((notification) => notification.id === selectedId)) {
      setSelectedId(filteredNotifications[0].id);
    }
  }, [filteredNotifications, selectedId]);

  const selectedNotification = useMemo(
    () =>
      filteredNotifications.find((notification) => notification.id === selectedId) ??
      null,
    [selectedId, filteredNotifications],
  );

  const updateNotification = async (
    id: string,
    changes: Pick<NotificationDTO, "isDone"> | Pick<NotificationDTO, "isArchived">,
  ) => {
    setPendingId(id);
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      const data = (await response.json().catch(() => ({}))) as {
        notification?: NotificationDTO;
        error?: string;
      };

      if (!response.ok || !data.notification) {
        throw new Error(data.error ?? "Benachrichtigung konnte nicht gespeichert werden.");
      }

      const savedNotification = data.notification;
      setItems((previous) =>
        previous.map((notification) =>
          notification.id === id ? savedNotification : notification,
        ),
      );
      setError(null);
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "Benachrichtigung konnte nicht gespeichert werden.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const deleteNotification = async (id: string) => {
    setPendingId(id);
    try {
      const response = await fetch(`/api/notifications/${id}`, { method: "DELETE" });
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Benachrichtigung konnte nicht gelöscht werden.");
      }

      setItems((previous) =>
        previous.filter((notification) => notification.id !== id),
      );
      setError(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Benachrichtigung konnte nicht gelöscht werden.",
      );
    } finally {
      setPendingId(null);
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    if (type === "exam") return <AlertCircle className="h-5 w-5" />;
    if (type === "missed-session") return <CalendarClock className="h-5 w-5" />;
    return <BookOpen className="h-5 w-5" />;
  };

  const getTypeLabel = (type: NotificationType) =>
    type === "exam"
      ? "Klausur"
      : type === "missed-session"
        ? "Lernsession"
        : "Abgabe";

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
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Benachrichtigungen suchen"
            className="w-full bg-transparent text-sm text-gray-700 placeholder:text-gray-500 focus:outline-none"
          />
        </label>
      </header>

      <div className="grid flex-1 overflow-hidden lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="flex min-h-0 flex-col border-b border-gray-200 lg:border-r lg:border-b-0">
          <div className="border-b border-gray-200 px-4 py-3">
            <div
              role="tablist"
              aria-label="Filter"
              className="flex gap-1 overflow-x-auto rounded-xl bg-gray-100 p-1 dark:bg-white/5"
            >
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
                      "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-white text-gray-900 shadow-sm dark:bg-white/10 dark:text-white"
                        : "text-gray-500 hover:text-gray-700 dark:text-white/65 dark:hover:text-white",
                    )}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-auto">
            {loading ? (
              <p className="px-4 py-8 text-center text-sm text-gray-500">
                Benachrichtigungen werden geladen...
              </p>
            ) : error && items.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-red-600">{error}</p>
            ) : filteredNotifications.length === 0 ? (
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
                      "flex w-full gap-3 border-b border-gray-100 px-4 py-4 text-left transition-colors hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5",
                      notification.isUrgent &&
                        "border-l-4 border-l-[#ef233c] bg-red-50/70 hover:bg-red-50 dark:bg-[#351316] dark:hover:bg-[#43171b]",
                      isSelected &&
                        (notification.isUrgent
                          ? "bg-red-50 dark:bg-[#43171b]"
                          : "bg-gray-50 dark:bg-white/5"),
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
                          <div className="flex min-w-0 items-center gap-2">
                            <p className="truncate text-sm font-semibold text-gray-900 dark:text-white">
                              {notification.subject}
                            </p>
                            {notification.isUrgent && (
                              <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700 ring-1 ring-red-200 dark:bg-[#ef233c]/20 dark:text-white dark:ring-[#ef233c]/45">
                                Dringend
                              </span>
                            )}
                          </div>
                          <p className="truncate text-xs text-gray-500 dark:text-white/65">
                            {notification.course}
                          </p>
                        </div>
                        {notification.isDone && (
                          <CheckCircle className="h-4 w-4 shrink-0 text-green-600" />
                        )}
                      </div>
                      <p className="mt-2 truncate text-sm font-semibold text-gray-800 dark:text-white/75">
                        Fällig: {formatDate(notification.dueDate)}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        <section className="flex min-h-0 flex-col bg-gray-50">
          {selectedNotification ? (
            <>
              <div
                className={cn(
                  "flex items-center justify-between border-b px-6 py-4",
                  selectedNotification.isUrgent
                    ? "border-red-200 bg-red-50 dark:border-[#ef233c]/45 dark:bg-[#2a1114]"
                    : "border-gray-200 bg-white dark:border-white/10 dark:bg-card",
                )}
              >
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
                    <div className="flex min-w-0 items-center gap-2">
                      <h2 className="truncate text-lg font-bold text-gray-900 dark:text-white">
                        {selectedNotification.subject}
                      </h2>
                      {selectedNotification.isUrgent && (
                        <span className="shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-xs font-semibold text-red-700 ring-1 ring-red-200 dark:bg-[#ef233c]/20 dark:text-white dark:ring-[#ef233c]/45">
                          Dringend
                        </span>
                      )}
                    </div>
                    <p className="truncate text-sm text-gray-500 dark:text-white/65">
                      {selectedNotification.course} ·{" "}
                      {getTypeLabel(selectedNotification.type)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 text-gray-500">
                  <button
                    type="button"
                    disabled={pendingId === selectedNotification.id}
                    onClick={() =>
                      updateNotification(selectedNotification.id, {
                        isDone: !selectedNotification.isDone,
                      })
                    }
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
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
                    disabled={pendingId === selectedNotification.id}
                    onClick={() =>
                      updateNotification(selectedNotification.id, {
                        isArchived: !selectedNotification.isArchived,
                      })
                    }
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label={
                      selectedNotification.isArchived
                        ? "Wiederherstellen"
                        : "Archivieren"
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
                    disabled={pendingId === selectedNotification.id}
                    onClick={() => deleteNotification(selectedNotification.id)}
                    className="rounded-lg p-2 transition-colors hover:bg-gray-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
                    aria-label="Benachrichtigung löschen"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-0 flex-1 space-y-6 overflow-auto px-6 py-6">
                {error && (
                  <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </p>
                )}
                <div
                  className={cn(
                    "rounded-lg border bg-white p-6 shadow-sm dark:bg-card",
                    selectedNotification.isUrgent
                      ? "border-red-200 dark:border-[#ef233c]/45"
                      : "border-gray-200 dark:border-white/10",
                  )}
                >
                  <div className="space-y-4">
                    <div>
                      <h3 className="mb-2 text-sm font-semibold text-gray-600 dark:text-white/75">
                        Beschreibung
                      </h3>
                      <p className="text-gray-800 dark:text-white">
                        {selectedNotification.description}
                      </p>
                    </div>

                    <div className="border-t border-gray-200 pt-4 dark:border-white/15">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-500 dark:text-white/60">
                            Fällig am
                          </p>
                          <p className="mt-1 text-lg font-bold text-gray-900 dark:text-white">
                            {formatDate(selectedNotification.dueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs font-medium uppercase text-gray-500 dark:text-white/60">
                            Status
                          </p>
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
              {loading
                ? "Benachrichtigungen werden geladen..."
                : "Wähle eine Benachrichtigung aus der Liste aus."}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
