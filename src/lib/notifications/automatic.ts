import type { Prisma } from "@prisma/client";
import { checkMissedSessionNotifications } from "@/lib/notifications/missedSessions";
import {
  getNotificationSettings,
  type NotificationSettingsDTO,
} from "@/lib/notifications/settings";
import { prisma } from "@/lib/prisma";

// Automatisch erzeugte Benachrichtigungen folgen alle demselben Muster wie die
// verpassten Lernsessions (siehe missedSessions.ts): Beim Laden der Notifications
// werden relevante Daten geprüft und – über einen eindeutigen triggerKey
// dedupliziert – neue Hinweise per createMany(skipDuplicates) angelegt.

const DATE_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const TIME_FORMATTER = new Intl.DateTimeFormat("de-DE", {
  hour: "2-digit",
  minute: "2-digit",
});

function startOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date): Date {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function startOfNextDay(date: Date): Date {
  const d = startOfDay(date);
  d.setDate(d.getDate() + 1);
  return d;
}

function dateKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

async function createNotifications(
  notifications: Prisma.NotificationCreateManyInput[],
): Promise<number> {
  if (notifications.length === 0) return 0;
  const result = await prisma.notification.createMany({
    data: notifications,
    skipDuplicates: true,
  });
  return result.count;
}

// ─── Deadline-Erinnerungen ──────────────────────────────────────────────────

/** Zieltermine (Lernpläne) und Aufgaben-Fälligkeiten im Vorlauf-Fenster. */
export async function checkDeadlineNotifications(
  ownerId: string,
  now: Date,
  settings: NotificationSettingsDTO,
): Promise<number> {
  if (!settings.deadlineRemindersEnabled) return 0;

  const windowEnd = new Date(now.getTime() + settings.deadlineLeadMinutes * 60 * 1000);
  const urgentThreshold = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const [plans, tasks] = await Promise.all([
    prisma.studyPlan.findMany({
      where: { ownerId, targetDate: { gte: now, lte: windowEnd } },
      select: { id: true, subject: true, goalType: true, targetDate: true },
    }),
    prisma.task.findMany({
      where: {
        completed: false,
        dueDate: { gte: now, lte: windowEnd },
        studyPlan: { ownerId },
      },
      select: {
        id: true,
        title: true,
        dueDate: true,
        studyPlan: { select: { subject: true } },
      },
    }),
  ]);

  const notifications: Prisma.NotificationCreateManyInput[] = [];

  for (const plan of plans) {
    const isExam = plan.goalType === "KLAUSUR" || plan.goalType === "PRAESENTATION";
    notifications.push({
      type: isExam ? "EXAM" : "ASSIGNMENT",
      subject: "Zieltermin steht an",
      course: plan.subject,
      dueDate: plan.targetDate,
      description: `Dein Zieltermin für "${plan.subject}" ist am ${DATE_FORMATTER.format(
        plan.targetDate,
      )}.`,
      isUrgent: plan.targetDate <= urgentThreshold,
      ownerId,
      expiresAt: endOfDay(plan.targetDate),
      triggerKey: `deadline:plan:${plan.id}`,
    });
  }

  for (const task of tasks) {
    notifications.push({
      type: "ASSIGNMENT",
      subject: "Aufgabe fällig",
      course: task.studyPlan.subject,
      dueDate: task.dueDate,
      description: `Die Aufgabe "${task.title}" ist am ${DATE_FORMATTER.format(
        task.dueDate,
      )} fällig.`,
      isUrgent: task.dueDate <= urgentThreshold,
      ownerId,
      expiresAt: endOfDay(task.dueDate),
      triggerKey: `deadline:task:${task.id}`,
    });
  }

  return createNotifications(notifications);
}

// ─── Überfällige Aufgaben ────────────────────────────────────────────────────

export async function checkOverdueTaskNotifications(
  ownerId: string,
  now: Date,
  settings: NotificationSettingsDTO,
): Promise<number> {
  if (!settings.overdueTaskRemindersEnabled) return 0;

  // Nur kürzlich überfällige Aufgaben (max. 30 Tage), damit keine uralten
  // Aufgaben dauerhaft Hinweise erzeugen.
  const oldestRelevant = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const tasks = await prisma.task.findMany({
    where: {
      completed: false,
      dueDate: { lt: now, gte: oldestRelevant },
      studyPlan: { ownerId },
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      studyPlan: { select: { subject: true } },
    },
  });

  const notifications: Prisma.NotificationCreateManyInput[] = tasks.map((task) => ({
    type: "ASSIGNMENT",
    subject: "Aufgabe überfällig",
    course: task.studyPlan.subject,
    dueDate: task.dueDate,
    description: `Die Aufgabe "${task.title}" war am ${DATE_FORMATTER.format(
      task.dueDate,
    )} fällig und ist noch offen.`,
    isUrgent: true,
    ownerId,
    // Hinweis bleibt zwei Wochen nach Fälligkeit bestehen, danach läuft er ab.
    expiresAt: new Date(task.dueDate.getTime() + 14 * 24 * 60 * 60 * 1000),
    triggerKey: `overdue:task:${task.id}`,
  }));

  return createNotifications(notifications);
}

// ─── Bevorstehende Lernsessions (heute) ──────────────────────────────────────

export async function checkUpcomingSessionNotifications(
  ownerId: string,
  now: Date,
  settings: NotificationSettingsDTO,
): Promise<number> {
  if (!settings.sessionRemindersEnabled) return 0;

  const events = await prisma.calendarEvent.findMany({
    where: {
      ownerId,
      source: "LOCAL",
      type: "LERNEINHEIT",
      startsAt: { gt: now, lte: endOfDay(now) },
    },
    select: {
      id: true,
      title: true,
      subject: true,
      startsAt: true,
      studyPlan: { select: { subject: true } },
    },
  });

  const notifications: Prisma.NotificationCreateManyInput[] = events.map((event) => ({
    type: "ASSIGNMENT",
    subject: "Lernsession heute",
    course: event.subject?.trim() || event.studyPlan?.subject?.trim() || "Lernsession",
    dueDate: event.startsAt,
    description: `Heute um ${TIME_FORMATTER.format(event.startsAt)} Uhr ist "${
      event.title
    }" geplant.`,
    isUrgent: false,
    ownerId,
    expiresAt: endOfDay(now),
    triggerKey: `session-upcoming:${event.id}`,
  }));

  return createNotifications(notifications);
}

// ─── Tägliche Lernübersicht ──────────────────────────────────────────────────

function isPastDigestTime(now: Date, digestTime: string): boolean {
  const [hours, minutes] = digestTime.split(":").map((part) => Number(part));
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return false;
  const threshold = startOfDay(now);
  threshold.setHours(hours, minutes, 0, 0);
  return now >= threshold;
}

export async function checkDailyDigestNotification(
  ownerId: string,
  now: Date,
  settings: NotificationSettingsDTO,
): Promise<number> {
  if (!settings.dailyDigestEnabled) return 0;
  if (!isPastDigestTime(now, settings.digestTime)) return 0;

  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [todaysSessions, openTasks, upcomingPlanDeadlines, upcomingTaskDeadlines] =
    await Promise.all([
      prisma.calendarEvent.count({
        where: {
          ownerId,
          source: "LOCAL",
          type: "LERNEINHEIT",
          startsAt: { gte: todayStart, lte: todayEnd },
        },
      }),
      prisma.task.count({
        where: { completed: false, studyPlan: { ownerId } },
      }),
      prisma.studyPlan.count({
        where: { ownerId, targetDate: { gte: now, lte: weekEnd } },
      }),
      prisma.task.count({
        where: {
          completed: false,
          dueDate: { gte: now, lte: weekEnd },
          studyPlan: { ownerId },
        },
      }),
    ]);

  const upcomingDeadlines = upcomingPlanDeadlines + upcomingTaskDeadlines;

  // Nichts Berichtenswertes → keine leere Übersicht erzeugen.
  if (todaysSessions === 0 && openTasks === 0 && upcomingDeadlines === 0) {
    return 0;
  }

  const description =
    `${todaysSessions} Lernsession${todaysSessions === 1 ? "" : "s"} heute, ` +
    `${openTasks} offene Aufgabe${openTasks === 1 ? "" : "n"}, ` +
    `${upcomingDeadlines} Frist${upcomingDeadlines === 1 ? "" : "en"} in den nächsten 7 Tagen.`;

  return createNotifications([
    {
      type: "ASSIGNMENT",
      subject: "Tägliche Lernübersicht",
      course: "Übersicht",
      dueDate: now,
      description,
      isUrgent: false,
      ownerId,
      expiresAt: startOfNextDay(now),
      triggerKey: `daily-digest:${dateKey(now)}`,
    },
  ]);
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

export interface NotificationCheckResult {
  createdNotificationCount: number;
}

/**
 * Führt alle aktivierten automatischen Benachrichtigungs-Checks aus.
 * Jeder Check ist isoliert: schlägt einer fehl, brechen die übrigen (und damit
 * die Notifications-Seite) nicht ab.
 */
export async function runNotificationChecks(
  ownerId: string,
  now = new Date(),
): Promise<NotificationCheckResult> {
  const settings = await getNotificationSettings(ownerId);
  let createdNotificationCount = 0;

  const checks: Array<() => Promise<number>> = [
    async () =>
      (await checkMissedSessionNotifications(ownerId, now, settings))
        .createdNotificationCount,
    () => checkDeadlineNotifications(ownerId, now, settings),
    () => checkOverdueTaskNotifications(ownerId, now, settings),
    () => checkUpcomingSessionNotifications(ownerId, now, settings),
    () => checkDailyDigestNotification(ownerId, now, settings),
  ];

  for (const check of checks) {
    try {
      createdNotificationCount += await check();
    } catch (error) {
      console.error("[notifications] Check fehlgeschlagen:", error);
    }
  }

  return { createdNotificationCount };
}
