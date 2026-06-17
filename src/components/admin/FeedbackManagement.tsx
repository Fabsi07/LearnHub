"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Inbox,
  MessageSquareText,
  RefreshCw,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FEEDBACK_CATEGORIES,
  FEEDBACK_PRIORITIES,
  FEEDBACK_STATUSES,
  feedbackCategoryLabels,
  feedbackPriorityLabels,
  feedbackPriorityRank,
  feedbackStatusLabels,
  type FeedbackCategory,
  type FeedbackListItem,
  type FeedbackPayload,
  type FeedbackPriority,
  type FeedbackStatus,
} from "@/lib/feedback/types";
import { cn } from "@/lib/utils";

type CategoryFilter = FeedbackCategory | "ALL";
type SortMode = "created-desc" | "created-asc" | "priority-desc" | "priority-asc";

const SELECT_CLASSES =
  "admin-role-select h-8 w-full rounded-lg border border-input px-2.5 text-sm outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50";

const OPTION_CLASSES = "admin-role-select-option";

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

interface FeedbackManagementProps {
  initialData: FeedbackPayload;
  onNewCountChange?: (count: number) => void;
}

export function FeedbackManagement({ initialData, onNewCountChange }: FeedbackManagementProps) {
  const [feedbacks, setFeedbacks] = useState<FeedbackListItem[]>(initialData.feedbacks);
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("ALL");
  const [sortMode, setSortMode] = useState<SortMode>("created-desc");
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [selectedFeedbackId, setSelectedFeedbackId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(
    null,
  );

  const openCount = useMemo(
    () => feedbacks.filter((feedback) => feedback.status === "OPEN").length,
    [feedbacks],
  );
  const criticalCount = useMemo(
    () => feedbacks.filter((feedback) => feedback.priority === "CRITICAL").length,
    [feedbacks],
  );
  const doneCount = useMemo(
    () => feedbacks.filter((feedback) => feedback.status === "DONE").length,
    [feedbacks],
  );
  const selectedFeedback = useMemo(
    () => feedbacks.find((feedback) => feedback.id === selectedFeedbackId) ?? null,
    [feedbacks, selectedFeedbackId],
  );

  useEffect(() => {
    onNewCountChange?.(openCount);
  }, [onNewCountChange, openCount]);

  const visibleFeedbacks = useMemo(() => {
    return feedbacks
      .filter((feedback) => categoryFilter === "ALL" || feedback.category === categoryFilter)
      .sort((a, b) => {
        if (sortMode === "created-desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortMode === "created-asc") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortMode === "priority-desc") {
          return (
            feedbackPriorityRank[b.priority] - feedbackPriorityRank[a.priority] ||
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        }
        return (
          feedbackPriorityRank[a.priority] - feedbackPriorityRank[b.priority] ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      });
  }, [categoryFilter, feedbacks, sortMode]);

  async function applyFeedbackResponse(response: Response) {
    const data = (await response.json().catch(() => null)) as
      | (Partial<FeedbackPayload> & { error?: string })
      | null;

    if (!response.ok) {
      throw new Error(data?.error ?? "Feedback-Aktion fehlgeschlagen.");
    }

    if (Array.isArray(data?.feedbacks)) {
      setFeedbacks(data.feedbacks);
    }
  }

  async function reloadFeedbacks() {
    setLoading(true);
    setMessage(null);
    try {
      const response = await fetch("/api/feedback");
      await applyFeedbackResponse(response);
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Feedbacks konnten nicht geladen werden.",
      });
    } finally {
      setLoading(false);
    }
  }

  async function updateFeedback(
    feedback: FeedbackListItem,
    changes: Partial<Pick<FeedbackListItem, "category" | "priority" | "status">>,
  ) {
    setSavingId(feedback.id);
    setMessage(null);
    try {
      const response = await fetch(`/api/feedback/${feedback.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(changes),
      });
      await applyFeedbackResponse(response);
      setMessage({ type: "success", text: "Feedback wurde aktualisiert." });
    } catch (error) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Feedback konnte nicht aktualisiert werden.",
      });
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="grid gap-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          icon={MessageSquareText}
          label="Feedbacks gesamt"
          value={feedbacks.length}
          tone="gray"
        />
        <SummaryCard icon={Inbox} label="Neu/offen" value={openCount} tone="blue" />
        <SummaryCard
          icon={AlertTriangle}
          label="Kritisch"
          value={criticalCount}
          tone="red"
        />
        <SummaryCard icon={CheckCircle2} label="Umgesetzt" value={doneCount} tone="green" />
      </div>

      {message && (
        <p
          role="status"
          className={cn(
            "rounded-lg border px-4 py-3 text-sm font-medium",
            message.type === "success"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700",
          )}
        >
          {message.text}
        </p>
      )}

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
        <div className="grid gap-4 border-b border-gray-100 px-5 py-4 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-700">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-950">Feedback-Verwaltung</h2>
              <p className="text-sm text-gray-500">
                Kategorie, Wichtigkeit und Bearbeitungsstatus verwalten.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[190px_190px_auto]">
            <select
              aria-label="Nach Kategorie filtern"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
              className={SELECT_CLASSES}
            >
              <option value="ALL" className={OPTION_CLASSES}>
                Alle Kategorien
              </option>
              {FEEDBACK_CATEGORIES.map((category) => (
                <option key={category} value={category} className={OPTION_CLASSES}>
                  {feedbackCategoryLabels[category]}
                </option>
              ))}
            </select>

            <select
              aria-label="Feedback sortieren"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value as SortMode)}
              className={SELECT_CLASSES}
            >
              <option value="created-desc" className={OPTION_CLASSES}>
                Neueste zuerst
              </option>
              <option value="created-asc" className={OPTION_CLASSES}>
                Älteste zuerst
              </option>
              <option value="priority-desc" className={OPTION_CLASSES}>
                Wichtigkeit absteigend
              </option>
              <option value="priority-asc" className={OPTION_CLASSES}>
                Wichtigkeit aufsteigend
              </option>
            </select>

            <Button type="button" variant="outline" onClick={reloadFeedbacks} disabled={loading}>
              <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              Aktualisieren
            </Button>
          </div>
        </div>

        {visibleFeedbacks.length === 0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 px-5 py-12 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
              <Clock3 className="h-6 w-6" />
            </div>
            <div>
              <p className="font-semibold text-gray-950">Keine Feedbacks gefunden</p>
              <p className="mt-1 text-sm text-gray-500">
                Fuer die aktuelle Filterauswahl liegen keine Eintraege vor.
              </p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-left text-sm">
              <thead className="bg-gray-50 text-xs font-semibold uppercase tracking-wider text-gray-500">
                <tr>
                  <th className="px-5 py-3">Feedback</th>
                  <th className="px-5 py-3">Kategorie</th>
                  <th className="px-5 py-3">Wichtigkeit</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Eingang</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visibleFeedbacks.map((feedback) => {
                  const rowSaving = savingId === feedback.id;

                  return (
                    <tr key={feedback.id} className="align-middle">
                      <td className="max-w-[420px] px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelectedFeedbackId(feedback.id)}
                          className="group grid w-full gap-1 rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        >
                          <span className="font-semibold text-gray-950 group-hover:text-brand-red">
                            {feedback.title}
                          </span>
                          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700">
                            Feedback ansehen
                          </span>
                        </button>
                      </td>
                      <td className="px-5 py-4">
                        <div className="grid gap-2">
                          <select
                            aria-label="Kategorie setzen"
                            value={feedback.category}
                            disabled={rowSaving}
                            onChange={(event) =>
                              updateFeedback(feedback, {
                                category: event.target.value as FeedbackCategory,
                              })
                            }
                            className={SELECT_CLASSES}
                          >
                            {FEEDBACK_CATEGORIES.map((category) => (
                              <option key={category} value={category} className={OPTION_CLASSES}>
                                {feedbackCategoryLabels[category]}
                              </option>
                            ))}
                          </select>
                          <span className="text-xs text-gray-500">
                            Eingereicht: {feedbackCategoryLabels[feedback.submittedCategory]}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <select
                            aria-label="Wichtigkeit setzen"
                            value={feedback.priority}
                            disabled={rowSaving}
                            onChange={(event) =>
                              updateFeedback(feedback, {
                                priority: event.target.value as FeedbackPriority,
                              })
                            }
                            className={SELECT_CLASSES}
                          >
                            {FEEDBACK_PRIORITIES.map((priority) => (
                              <option key={priority} value={priority} className={OPTION_CLASSES}>
                                {feedbackPriorityLabels[priority]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>
                          <select
                            aria-label="Status setzen"
                            value={feedback.status}
                            disabled={rowSaving}
                            onChange={(event) =>
                              updateFeedback(feedback, {
                                status: event.target.value as FeedbackStatus,
                              })
                            }
                            className={SELECT_CLASSES}
                          >
                            {FEEDBACK_STATUSES.map((status) => (
                              <option key={status} value={status} className={OPTION_CLASSES}>
                                {feedbackStatusLabels[status]}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-gray-600">
                        {formatDateTime(feedback.createdAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {selectedFeedback && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedFeedbackId(null);
            }
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="feedback-detail-title"
            className="grid max-h-[85vh] w-full max-w-2xl gap-5 overflow-auto rounded-lg border border-gray-200 bg-white p-5 shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-500">Feedback</p>
                <h3
                  id="feedback-detail-title"
                  className="mt-1 break-words text-xl font-bold text-gray-950"
                >
                  {selectedFeedback.title}
                </h3>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Feedback schliessen"
                onClick={() => setSelectedFeedbackId(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <dl className="grid gap-3 text-sm sm:grid-cols-2">
              <DetailItem
                label="Aktuelle Kategorie"
                value={feedbackCategoryLabels[selectedFeedback.category]}
              />
              <DetailItem
                label="Wichtigkeit"
                value={feedbackPriorityLabels[selectedFeedback.priority]}
              />
              <DetailItem label="Status" value={feedbackStatusLabels[selectedFeedback.status]} />
              <DetailItem label="Eingegangen" value={formatDateTime(selectedFeedback.createdAt)} />
              <DetailItem label="Aktualisiert" value={formatDateTime(selectedFeedback.updatedAt)} />
            </dl>

            <div>
              <p className="text-sm font-semibold text-gray-950">Beschreibung</p>
              <p className="mt-2 whitespace-pre-wrap break-words rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                {selectedFeedback.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface SummaryCardProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number;
  tone: "gray" | "blue" | "red" | "green";
}

interface DetailItemProps {
  label: string;
  value: string;
}

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <div className="rounded-lg border border-gray-200 bg-gray-50 px-3 py-2">
      <dt className="text-xs font-semibold uppercase tracking-wider text-gray-500">{label}</dt>
      <dd className="mt-1 font-semibold text-gray-950">{value}</dd>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, tone }: SummaryCardProps) {
  const toneClass = {
    gray: "bg-gray-100 text-gray-700",
    blue: "bg-blue-50 text-blue-700",
    red: "bg-red-50 text-red-700",
    green: "bg-green-50 text-green-700",
  }[tone];

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3">
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-lg", toneClass)}>
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-950">{value}</p>
          <p className="text-sm text-gray-500">{label}</p>
        </div>
      </div>
    </div>
  );
}
