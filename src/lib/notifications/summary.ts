import type { NotificationDTO } from "@/lib/notifications/types";

export interface NotificationSummary {
  openCount: number;
  urgentCount: number;
  missedSessionCount: number;
}

export const EMPTY_NOTIFICATION_SUMMARY: NotificationSummary = {
  openCount: 0,
  urgentCount: 0,
  missedSessionCount: 0,
};

export function summarizeNotifications(
  notifications: Pick<
    NotificationDTO,
    "type" | "isDone" | "isArchived" | "isUrgent"
  >[],
): NotificationSummary {
  const openNotifications = notifications.filter(
    (notification) => !notification.isDone && !notification.isArchived,
  );

  return {
    openCount: openNotifications.length,
    urgentCount: openNotifications.filter((notification) => notification.isUrgent)
      .length,
    missedSessionCount: openNotifications.filter(
      (notification) => notification.type === "missed-session",
    ).length,
  };
}
