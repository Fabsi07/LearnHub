-- AlterTable
ALTER TABLE "StudyPlan" ADD COLUMN     "credits" INTEGER,
ADD COLUMN     "difficulty" INTEGER,
ADD COLUMN     "hoursPerDay" DOUBLE PRECISION,
ADD COLUMN     "pages" INTEGER,
ADD COLUMN     "planType" TEXT,
ADD COLUMN     "priorKnowledge" INTEGER,
ADD COLUMN     "totalHours" DOUBLE PRECISION;
