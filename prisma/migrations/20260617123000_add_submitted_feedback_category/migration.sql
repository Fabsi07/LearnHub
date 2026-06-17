-- AlterTable
ALTER TABLE "Feedback" ADD COLUMN "submittedCategory" "FeedbackCategory";

-- Backfill existing rows with the category originally stored before admin recategorization support.
UPDATE "Feedback" SET "submittedCategory" = "category" WHERE "submittedCategory" IS NULL;

-- AlterTable
ALTER TABLE "Feedback" ALTER COLUMN "submittedCategory" SET NOT NULL;

-- CreateIndex
CREATE INDEX "Feedback_submittedCategory_idx" ON "Feedback"("submittedCategory");
