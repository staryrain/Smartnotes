import Database from 'better-sqlite3'
import { app } from 'electron'
import { join } from 'path'

// In production, use userData directory. In dev, use local file.
const dbPath = app.isPackaged
  ? join(app.getPath('userData'), 'smartnotes.db')
  : join(process.cwd(), 'dev.db')

export const db = new Database(dbPath, { verbose: console.log })

// Enable foreign keys
db.pragma('foreign_keys = ON')

// Initialize tables
const initDb = () => {
  const createTables = [
    `CREATE TABLE IF NOT EXISTS LongTermGoal (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )`,
    `CREATE TABLE IF NOT EXISTS DailyTask (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      status TEXT NOT NULL,
      type TEXT NOT NULL,
      planDate INTEGER,
      longTermId TEXT,
      recurringTaskId TEXT,
      isPersist INTEGER DEFAULT 0,
      createdAt INTEGER NOT NULL,
      updatedAt INTEGER NOT NULL,
      FOREIGN KEY(longTermId) REFERENCES LongTermGoal(id)
    )`,
    `CREATE TABLE IF NOT EXISTS RecurringTask (
      id TEXT PRIMARY KEY,
      content TEXT NOT NULL,
      longTermGoalId TEXT NOT NULL,
      createdAt INTEGER NOT NULL,
      FOREIGN KEY(longTermGoalId) REFERENCES LongTermGoal(id) ON DELETE CASCADE
    )`,
    `CREATE TABLE IF NOT EXISTS Achievement (
      id TEXT PRIMARY KEY,
      year INTEGER NOT NULL,
      month INTEGER NOT NULL,
      content TEXT NOT NULL,
      recordTime TEXT NOT NULL,
      createdAt INTEGER NOT NULL
    )`
  ]

  db.transaction(() => {
    for (const sql of createTables) {
      db.prepare(sql).run()
    }
    
    // Migrations
    try {
      db.prepare('ALTER TABLE DailyTask ADD COLUMN isPinned INTEGER DEFAULT 0').run()
    } catch (e) {
      // Column already exists
    }
    
    try {
      db.prepare('ALTER TABLE DailyTask ADD COLUMN pinnedAt INTEGER DEFAULT NULL').run()
    } catch (e) {
      // Column already exists
    }

    try {
      db.prepare('ALTER TABLE DailyTask ADD COLUMN list_order INTEGER DEFAULT 0').run()
    } catch (e) {
      // Column already exists
    }

    try {
      db.prepare('ALTER TABLE DailyTask ADD COLUMN isCustomTime INTEGER DEFAULT 0').run()
    } catch (e) {
      // Column already exists
    }
  })()
}

initDb()

export default db
