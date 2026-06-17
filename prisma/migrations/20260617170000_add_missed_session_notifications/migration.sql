-- Extend notifications for missed learning sessions.
ALTER TYPE "NotificationType" ADD VALUE 'MISSED_SESSION';

ALTER TABLE "Notification" ADD COLUMN "triggerKey" TEXT;

CREATE UNIQUE INDEX "Notification_ownerId_triggerKey_key" ON "Notification"("ownerId", "triggerKey");

CREATE TABLE "NotificationSettings" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "missedSessionRescheduleEnabled" BOOLEAN NOT NULL DEFAULT true,
    "missedSessionReplanWarningEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NotificationSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "NotificationSettings_ownerId_key" ON "NotificationSettings"("ownerId");

ALTER TABLE "NotificationSettings" ADD CONSTRAINT "NotificationSettings_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
