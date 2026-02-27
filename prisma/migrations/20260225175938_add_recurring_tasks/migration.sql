-- AlterTable
ALTER TABLE "DailyTask" ADD COLUMN "recurringTaskId" TEXT;

-- CreateTable
CREATE TABLE "RecurringTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "longTermGoalId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RecurringTask_longTermGoalId_fkey" FOREIGN KEY ("longTermGoalId") REFERENCES "LongTermGoal" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
