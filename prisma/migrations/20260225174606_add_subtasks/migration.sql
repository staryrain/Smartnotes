-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_DailyTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "content" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "planDate" DATETIME,
    "longTermId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DailyTask_longTermId_fkey" FOREIGN KEY ("longTermId") REFERENCES "LongTermGoal" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_DailyTask" ("content", "createdAt", "id", "planDate", "status", "type", "updatedAt") SELECT "content", "createdAt", "id", "planDate", "status", "type", "updatedAt" FROM "DailyTask";
DROP TABLE "DailyTask";
ALTER TABLE "new_DailyTask" RENAME TO "DailyTask";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
