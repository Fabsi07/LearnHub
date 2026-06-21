import type { NotificationSettings as DbNotificationSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface NotificationSettingsDTO {
  missedSessionRescheduleEnabled: boolean;
  missedSessionReplanWarningEnabled: boolean;
  deadlineRemindersEnabled: boolean;
  deadlineLeadMinutes: number;
  dailyDigestEnabled: boolean;
  digestTime: string;
  sessionRemindersEnabled: boolean;
  overdueTaskRemindersEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDTO = {
  missedSessionRescheduleEnabled: true,
  missedSessionReplanWarningEnabled: true,
  deadlineRemindersEnabled: true,
  deadlineLeadMinutes: 1440,
  dailyDigestEnabled: true,
  digestTime: "18:00",
  sessionRemindersEnabled: true,
  overdueTaskRemindersEnabled: false,
};

/** Erlaubte Vorlaufzeiten (Minuten) für Deadline-Erinnerungen. */
export const DEADLINE_LEAD_MINUTE_OPTIONS = [10, 60, 1440, 4320] as const;

/** Erlaubte Uhrzeiten für die tägliche Lernübersicht. */
export const DIGEST_TIME_OPTIONS = ["07:00", "12:00", "18:00", "20:00"] as const;

export function serializeNotificationSettings(
  settings: DbNotificationSettings,
): NotificationSettingsDTO {
  return {
    missedSessionRescheduleEnabled: settings.missedSessionRescheduleEnabled,
    missedSessionReplanWarningEnabled: settings.missedSessionReplanWarningEnabled,
    deadlineRemindersEnabled: settings.deadlineRemindersEnabled,
    deadlineLeadMinutes: settings.deadlineLeadMinutes,
    dailyDigestEnabled: settings.dailyDigestEnabled,
    digestTime: settings.digestTime,
    sessionRemindersEnabled: settings.sessionRemindersEnabled,
    overdueTaskRemindersEnabled: settings.overdueTaskRemindersEnabled,
  };
}

/**
 * Validiert einen rohen Request-Body und gibt eine vollständige, normalisierte
 * DTO zurück – oder null, wenn die Eingabe ungültig ist. Unbekannte Werte für
 * Vorlauf/Uhrzeit werden abgelehnt, damit nur erlaubte Optionen gespeichert werden.
 */
export function parseNotificationSettings(
  body: unknown,
): NotificationSettingsDTO | null {
  if (typeof body !== "object" || body === null) return null;
  const input = body as Record<string, unknown>;

  const booleanKeys = [
    "missedSessionRescheduleEnabled",
    "missedSessionReplanWarningEnabled",
    "deadlineRemindersEnabled",
    "dailyDigestEnabled",
    "sessionRemindersEnabled",
    "overdueTaskRemindersEnabled",
  ] as const;

  for (const key of booleanKeys) {
    if (typeof input[key] !== "boolean") return null;
  }

  if (
    typeof input.deadlineLeadMinutes !== "number" ||
    !DEADLINE_LEAD_MINUTE_OPTIONS.includes(
      input.deadlineLeadMinutes as (typeof DEADLINE_LEAD_MINUTE_OPTIONS)[number],
    )
  ) {
    return null;
  }

  if (
    typeof input.digestTime !== "string" ||
    !DIGEST_TIME_OPTIONS.includes(
      input.digestTime as (typeof DIGEST_TIME_OPTIONS)[number],
    )
  ) {
    return null;
  }

  return {
    missedSessionRescheduleEnabled: input.missedSessionRescheduleEnabled as boolean,
    missedSessionReplanWarningEnabled:
      input.missedSessionReplanWarningEnabled as boolean,
    deadlineRemindersEnabled: input.deadlineRemindersEnabled as boolean,
    deadlineLeadMinutes: input.deadlineLeadMinutes,
    dailyDigestEnabled: input.dailyDigestEnabled as boolean,
    digestTime: input.digestTime,
    sessionRemindersEnabled: input.sessionRemindersEnabled as boolean,
    overdueTaskRemindersEnabled: input.overdueTaskRemindersEnabled as boolean,
  };
}

export async function getNotificationSettings(
  ownerId: string,
): Promise<NotificationSettingsDTO> {
  const settings = await prisma.notificationSettings.upsert({
    where: { ownerId },
    update: {},
    create: {
      ownerId,
      ...DEFAULT_NOTIFICATION_SETTINGS,
    },
  });

  return serializeNotificationSettings(settings);
}

export async function updateNotificationSettings(
  ownerId: string,
  settings: NotificationSettingsDTO,
): Promise<NotificationSettingsDTO> {
  const savedSettings = await prisma.notificationSettings.upsert({
    where: { ownerId },
    update: settings,
    create: {
      ownerId,
      ...settings,
    },
  });

  return serializeNotificationSettings(savedSettings);
}
