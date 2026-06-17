export const FEEDBACK_CATEGORIES = ["BUG", "IMPROVEMENT", "FEATURE"] as const;
export const FEEDBACK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export const FEEDBACK_STATUSES = ["OPEN", "IN_PROGRESS", "DONE", "REJECTED"] as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[number];
export type FeedbackPriority = (typeof FEEDBACK_PRIORITIES)[number];
export type FeedbackStatus = (typeof FEEDBACK_STATUSES)[number];

export interface FeedbackListItem {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  submittedCategory: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackPayload {
  total: number;
  newCount: number;
  feedbacks: FeedbackListItem[];
}

interface FeedbackRow {
  id: string;
  title: string;
  description: string;
  category: FeedbackCategory;
  submittedCategory: FeedbackCategory;
  priority: FeedbackPriority;
  status: FeedbackStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  BUG: "Fehlerbehebung",
  IMPROVEMENT: "Verbesserungsvorschlag",
  FEATURE: "Neues Feature",
};

export const feedbackPriorityLabels: Record<FeedbackPriority, string> = {
  LOW: "Niedrig",
  MEDIUM: "Mittel",
  HIGH: "Hoch",
  CRITICAL: "Kritisch",
};

export const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Umgesetzt",
  REJECTED: "Abgelehnt",
};

export const feedbackPriorityRank: Record<FeedbackPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

export function serializeFeedback(feedback: FeedbackRow): FeedbackListItem {
  return {
    id: feedback.id,
    title: feedback.title,
    description: feedback.description,
    category: feedback.category,
    submittedCategory: feedback.submittedCategory,
    priority: feedback.priority,
    status: feedback.status,
    createdAt: feedback.createdAt.toISOString(),
    updatedAt: feedback.updatedAt.toISOString(),
  };
}
