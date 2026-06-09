-- DropForeignKey
ALTER TABLE "CalendarEvent" DROP CONSTRAINT "CalendarEvent_ownerId_fkey";

-- AlterTable
ALTER TABLE "CalendarEvent" ADD COLUMN     "notes" TEXT,
ADD COLUMN     "repeat" TEXT,
ADD COLUMN     "subject" TEXT,
ALTER COLUMN "ownerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
