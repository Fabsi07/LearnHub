import type {
  Notification as DbNotification,
  NotificationType as DbNotificationType,
} from "@prisma/client";

export type NotificationType = "assignment" | "exam";

export interface NotificationDTO {
  id: string;
  type: NotificationType;
  subject: string;
  course: string;
  dueDate: string;
  description: string;
  isUrgent: boolean;
  isDone: boolean;
  isArchived: boolean;
  createdAt: string;
  expiresAt: string;
}

export function toDbNotificationType(type: NotificationType): DbNotificationType {
  return type === "exam" ? "EXAM" : "ASSIGNMENT";
}

export function isNotificationType(value: unknown): value is NotificationType {
  return value === "assignment" || value === "exam";
}

export function serializeNotification(notification: DbNotification): NotificationDTO {
  return {
    id: notification.id,
    type: notification.type === "EXAM" ? "exam" : "assignment",
    subject: notification.subject,
    course: notification.course,
    dueDate: notification.dueDate.toISOString(),
    description: notification.description,
    isUrgent: notification.isUrgent,
    isDone: notification.isDone,
    isArchived: notification.isArchived,
    createdAt: notification.createdAt.toISOString(),
    expiresAt: notification.expiresAt.toISOString(),
  };
}
