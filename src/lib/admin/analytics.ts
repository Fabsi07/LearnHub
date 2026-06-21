import type {
  FeedbackCategory,
  FeedbackPriority,
  FeedbackStatus,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AnalyticsBucket {
  key: string;
  label: string;
  count: number;
  percentage: number;
}

export interface AdminAnalyticsPayload {
  generatedAt: string;
  users: {
    total: number;
    newLast30Days: number;
    activeSessionUsers: number;
    signedInLast30Days: number;
    adminAccounts: number;
    devAccounts: number;
    usersWithStudyPlans: number;
    usersWithCalendarSources: number;
  };
  learning: {
    studyPlans: number;
    activeStudyPlans: number;
    overdueStudyPlans: number;
    tasks: number;
    completedTasks: number;
    openTasks: number;
    overdueTasks: number;
    completionRate: number;
    averagePlanProgress: number;
    plannedHours: number;
    completedEstimatedHours: number;
  };
  calendar: {
    events: number;
    learningEvents: number;
    externalEvents: number;
    calendarSources: number;
    sourceAdoptionRate: number;
  };
  notifications: {
    total: number;
    open: number;
    urgent: number;
    missedSessionOpen: number;
  };
  feedback: {
    total: number;
    open: number;
    critical: number;
    done: number;
    byStatus: AnalyticsBucket[];
    byCategory: AnalyticsBucket[];
  };
}

const feedbackStatusLabels: Record<FeedbackStatus, string> = {
  OPEN: "Offen",
  IN_PROGRESS: "In Bearbeitung",
  DONE: "Umgesetzt",
  REJECTED: "Abgelehnt",
};

const feedbackCategoryLabels: Record<FeedbackCategory, string> = {
  BUG: "Fehler",
  IMPROVEMENT: "Verbesserung",
  FEATURE: "Feature",
};

const feedbackStatuses: FeedbackStatus[] = ["OPEN", "IN_PROGRESS", "DONE", "REJECTED"];
const feedbackCategories: FeedbackCategory[] = ["BUG", "IMPROVEMENT", "FEATURE"];

type CountableRow = {
  _count?: true | { _all?: number };
};

function percentage(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }
  return Math.round((part / total) * 100);
}

function hoursFromMinutes(minutes: number | null | undefined) {
  return Math.round(((minutes ?? 0) / 60) * 10) / 10;
}

function average(values: number[]) {
  if (values.length === 0) {
    return 0;
  }
  return Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 100);
}

function bucketRows<T extends string>(
  keys: T[],
  labels: Record<T, string>,
  rows: CountableRow[],
  total: number,
  field: string,
): AnalyticsBucket[] {
  return keys.map((key) => {
    const count = countAll(rows.find((row) => (row as Record<string, unknown>)[field] === key));

    return {
      key,
      label: labels[key],
      count,
      percentage: percentage(count, total),
    };
  });
}

function countAll(row: CountableRow | undefined) {
  if (!row || typeof row._count !== "object") {
    return 0;
  }
  return row._count._all ?? 0;
}

export async function getAdminAnalyticsPayload(): Promise<AdminAnalyticsPayload> {
  const now = new Date();
  const thirtyDaysAgo = new Date(now);
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [
    totalUsers,
    newLast30Days,
    roleGroups,
    activeSessions,
    recentSessions,
    usersWithStudyPlans,
    usersWithCalendarSources,
    studyPlans,
    activeStudyPlans,
    overdueStudyPlans,
    tasks,
    completedTasks,
    overdueTasks,
    plannedMinutes,
    completedMinutes,
    taskGroups,
    completedTaskGroups,
    calendarEvents,
    learningEvents,
    externalEvents,
    calendarSources,
    notifications,
    openNotifications,
    urgentNotifications,
    missedSessionOpen,
    feedbackTotal,
    openFeedback,
    criticalFeedback,
    doneFeedback,
    feedbackStatusGroups,
    feedbackCategoryGroups,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
    prisma.user.groupBy({
      by: ["role"],
      orderBy: { role: "asc" },
      _count: { _all: true },
    }),
    prisma.session.findMany({
      where: { expiresAt: { gt: now } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.session.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.studyPlan.findMany({
      distinct: ["ownerId"],
      select: { ownerId: true },
    }),
    prisma.calendarSource.findMany({
      distinct: ["userId"],
      select: { userId: true },
    }),
    prisma.studyPlan.count(),
    prisma.studyPlan.count({ where: { targetDate: { gte: now } } }),
    prisma.studyPlan.count({
      where: {
        targetDate: { lt: now },
        tasks: { some: { completed: false } },
      },
    }),
    prisma.task.count(),
    prisma.task.count({ where: { completed: true } }),
    prisma.task.count({
      where: {
        completed: false,
        dueDate: { lt: now },
      },
    }),
    prisma.task.aggregate({ _sum: { estimatedMinutes: true } }),
    prisma.task.aggregate({
      where: { completed: true },
      _sum: { estimatedMinutes: true },
    }),
    prisma.task.groupBy({
      by: ["studyPlanId"],
      orderBy: { studyPlanId: "asc" },
      _count: { _all: true },
    }),
    prisma.task.groupBy({
      by: ["studyPlanId"],
      where: { completed: true },
      orderBy: { studyPlanId: "asc" },
      _count: { _all: true },
    }),
    prisma.calendarEvent.count(),
    prisma.calendarEvent.count({ where: { type: "LERNEINHEIT" } }),
    prisma.calendarEvent.count({ where: { source: "EXTERNAL" } }),
    prisma.calendarSource.count(),
    prisma.notification.count(),
    prisma.notification.count({ where: { isDone: false, isArchived: false } }),
    prisma.notification.count({ where: { isUrgent: true, isDone: false, isArchived: false } }),
    prisma.notification.count({
      where: {
        type: "MISSED_SESSION",
        isDone: false,
        isArchived: false,
      },
    }),
    prisma.feedback.count(),
    prisma.feedback.count({ where: { status: "OPEN" } }),
    prisma.feedback.count({ where: { priority: "CRITICAL" satisfies FeedbackPriority } }),
    prisma.feedback.count({ where: { status: "DONE" } }),
    prisma.feedback.groupBy({
      by: ["status"],
      orderBy: { status: "asc" },
      _count: { _all: true },
    }),
    prisma.feedback.groupBy({
      by: ["category"],
      orderBy: { category: "asc" },
      _count: { _all: true },
    }),
  ]);

  const roleCount = (role: UserRole) =>
    countAll(roleGroups.find((group) => group.role === role));

  const completedByPlan = new Map(
    completedTaskGroups.map((group) => [group.studyPlanId, countAll(group)]),
  );
  const planProgressValues = taskGroups.map((group) => {
    const completedForPlan = completedByPlan.get(group.studyPlanId) ?? 0;
    const taskCount = countAll(group);
    return taskCount === 0 ? 0 : completedForPlan / taskCount;
  });

  return {
    generatedAt: now.toISOString(),
    users: {
      total: totalUsers,
      newLast30Days,
      activeSessionUsers: activeSessions.length,
      signedInLast30Days: recentSessions.length,
      adminAccounts: roleCount("ADMIN"),
      devAccounts: roleCount("DEV"),
      usersWithStudyPlans: usersWithStudyPlans.length,
      usersWithCalendarSources: usersWithCalendarSources.length,
    },
    learning: {
      studyPlans,
      activeStudyPlans,
      overdueStudyPlans,
      tasks,
      completedTasks,
      openTasks: tasks - completedTasks,
      overdueTasks,
      completionRate: percentage(completedTasks, tasks),
      averagePlanProgress: average(planProgressValues),
      plannedHours: hoursFromMinutes(plannedMinutes._sum.estimatedMinutes),
      completedEstimatedHours: hoursFromMinutes(completedMinutes._sum.estimatedMinutes),
    },
    calendar: {
      events: calendarEvents,
      learningEvents,
      externalEvents,
      calendarSources,
      sourceAdoptionRate: percentage(usersWithCalendarSources.length, totalUsers),
    },
    notifications: {
      total: notifications,
      open: openNotifications,
      urgent: urgentNotifications,
      missedSessionOpen,
    },
    feedback: {
      total: feedbackTotal,
      open: openFeedback,
      critical: criticalFeedback,
      done: doneFeedback,
      byStatus: bucketRows(
        feedbackStatuses,
        feedbackStatusLabels,
        feedbackStatusGroups,
        feedbackTotal,
        "status",
      ),
      byCategory: bucketRows(
        feedbackCategories,
        feedbackCategoryLabels,
        feedbackCategoryGroups,
        feedbackTotal,
        "category",
      ),
    },
  };
}
