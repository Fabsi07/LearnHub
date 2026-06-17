import type { Prisma } from "@prisma/client";
import { getNotificationSettings } from "@/lib/notifications/settings";
import { prisma } from "@/lib/prisma";

const AUTO_NOTIFICATION_EXPIRES_AT = new Date("2099-12-31T23:59:59.000Z");
const MISSED_SESSION_RESCHEDULE_SUBJECT = "Lernsession verpasst";
const MISSED_SESSION_REPLAN_SUBJECT = "Lernplan neu planen";

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export interface MissedSessionCheckResult {
  missedSessionCount: number;
  createdNotificationCount: number;
}

type MissedSession = {
  id: string;
  title: string;
  subject: string | null;
  endsAt: Date;
  task: {
    title: string;
    studyPlan: {
      title: string;
      subject: string;
    };
  } | null;
};

function getCourseLabel(session: MissedSession) {
  return (
    session.subject?.trim() ||
    session.task?.studyPlan.subject?.trim() ||
    session.task?.studyPlan.title?.trim() ||
    "Lernplan"
  );
}

function getSessionLabel(session: MissedSession) {
  return session.task?.title?.trim() || session.title;
}

function createRescheduleNotification(
  ownerId: string,
  session: MissedSession,
): Prisma.NotificationCreateManyInput {
  const sessionLabel = getSessionLabel(session);
  const course = getCourseLabel(session);

  return {
    type: "MISSED_SESSION",
    subject: MISSED_SESSION_RESCHEDULE_SUBJECT,
    course,
    dueDate: session.endsAt,
    description:
      `Du hast die Lernsession "${sessionLabel}" verpasst. ` +
      "Verschiebe sie auf einen anderen Tag, damit dein Lernplan realistisch bleibt.",
    isUrgent: false,
    ownerId,
    expiresAt: AUTO_NOTIFICATION_EXPIRES_AT,
    triggerKey: `missed-session:reschedule:${session.id}`,
  };
}

function createReplanNotification(
  ownerId: string,
  missedSessions: MissedSession[],
): Prisma.NotificationCreateManyInput {
  const firstMissedSession = missedSessions[0];
  const lastMissedSession = missedSessions[missedSessions.length - 1];
  const affectedCourses = Array.from(new Set(missedSessions.map(getCourseLabel)));
  const course =
    affectedCourses.length === 1
      ? affectedCourses[0]
      : `${affectedCourses.length} Lernbereiche`;

  return {
    type: "MISSED_SESSION",
    subject: MISSED_SESSION_REPLAN_SUBJECT,
    course,
    dueDate: lastMissedSession.endsAt,
    description:
      `Du hast ${missedSessions.length} Lernsessions verpasst. ` +
      `Die älteste offene Session endete am ${DATE_TIME_FORMATTER.format(firstMissedSession.endsAt)}. ` +
      "Erstelle deinen Lernplan neu, damit die verbleibenden Aufgaben wieder realistisch verteilt sind.",
    isUrgent: true,
    ownerId,
    expiresAt: AUTO_NOTIFICATION_EXPIRES_AT,
    triggerKey: "missed-session:replan",
  };
}

export async function checkMissedSessionNotifications(
  ownerId: string,
  now = new Date(),
): Promise<MissedSessionCheckResult> {
  const settings = await getNotificationSettings(ownerId);
  const missedSessions = await prisma.calendarEvent.findMany({
    where: {
      ownerId,
      source: "LOCAL",
      type: "LERNEINHEIT",
      taskId: { not: null },
      endsAt: { lt: now, gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) },
      task: { is: { completed: false } },
    },
    orderBy: { endsAt: "asc" },
    select: {
      id: true,
      title: true,
      subject: true,
      endsAt: true,
      task: {
        select: {
          title: true,
          studyPlan: {
            select: {
              title: true,
              subject: true,
            },
          },
        },
      },
    },
  });

  if (missedSessions.length === 0) {
    return { missedSessionCount: 0, createdNotificationCount: 0 };
  }

  const notifications: Prisma.NotificationCreateManyInput[] = [];

  if (
    missedSessions.length <= 2 &&
    settings.missedSessionRescheduleEnabled
  ) {
    notifications.push(
      ...missedSessions.map((missedSession) =>
        createRescheduleNotification(ownerId, missedSession),
      ),
    );
  }

  if (
    missedSessions.length >= 3 &&
    settings.missedSessionReplanWarningEnabled
  ) {
    notifications.push(createReplanNotification(ownerId, missedSessions));
  }

  if (notifications.length === 0) {
    return {
      missedSessionCount: missedSessions.length,
      createdNotificationCount: 0,
    };
  }

  const result = await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });

  return {
    missedSessionCount: missedSessions.length,
    createdNotificationCount: result.count,
  };
}
