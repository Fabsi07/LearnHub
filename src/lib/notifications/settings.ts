import type { NotificationSettings as DbNotificationSettings } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface NotificationSettingsDTO {
  missedSessionRescheduleEnabled: boolean;
  missedSessionReplanWarningEnabled: boolean;
}

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettingsDTO = {
  missedSessionRescheduleEnabled: true,
  missedSessionReplanWarningEnabled: true,
};

export function serializeNotificationSettings(
  settings: Pick<
    DbNotificationSettings,
    "missedSessionRescheduleEnabled" | "missedSessionReplanWarningEnabled"
  >,
): NotificationSettingsDTO {
  return {
    missedSessionRescheduleEnabled: settings.missedSessionRescheduleEnabled,
    missedSessionReplanWarningEnabled: settings.missedSessionReplanWarningEnabled,
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
