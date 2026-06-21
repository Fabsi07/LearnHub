-- Add deadline, daily digest and session notification preferences.
ALTER TABLE "NotificationSettings"
  ADD COLUMN "deadlineRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "deadlineLeadMinutes" INTEGER NOT NULL DEFAULT 1440,
  ADD COLUMN "dailyDigestEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "digestTime" TEXT NOT NULL DEFAULT '18:00',
  ADD COLUMN "sessionRemindersEnabled" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "overdueTaskRemindersEnabled" BOOLEAN NOT NULL DEFAULT false;
