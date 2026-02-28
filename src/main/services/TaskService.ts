import { db } from '../db'
import { randomUUID } from 'crypto'

export class TaskService {
  static async getTasks() {
    // 1. Get today's start
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTimestamp = today.getTime()

    // 2. Query: tasks created today OR tasks marked as persist (from previous days)
    const tasks = db.prepare(`
      SELECT * FROM DailyTask
      WHERE type = 'TODAY'
      AND (createdAt >= ? OR isPersist = 1)
      ORDER BY createdAt DESC
    `).all(todayTimestamp) as any[]

    return tasks.map(t => ({
      ...t,
      isPersist: Boolean(t.isPersist),
      createdAt: new Date(t.createdAt),
      updatedAt: new Date(t.updatedAt),
      planDate: t.planDate ? new Date(t.planDate) : null
    }))
  }

  static async createTask(content: string, longTermId?: string) {
    const id = randomUUID()
    const now = Date.now()
    const stmt = db.prepare(`
      INSERT INTO DailyTask (id, content, status, type, longTermId, isPersist, createdAt, updatedAt)
      VALUES (@id, @content, 'PENDING', 'TODAY', @longTermId, 0, @createdAt, @updatedAt)
    `)

    const task = {
      id,
      content,
      status: 'PENDING',
      type: 'TODAY',
      longTermId: longTermId || null,
      isPersist: false,
      createdAt: now,
      updatedAt: now,
      planDate: null,
      recurringTaskId: null
    }

    stmt.run({
      id: task.id,
      content: task.content,
      longTermId: task.longTermId,
      createdAt: task.createdAt,
      updatedAt: task.updatedAt
    })

    return {
      ...task,
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt)
    }
  }

  static async updateStatus(id: string, status: string) {
    const now = Date.now()
    const stmt = db.prepare(`
      UPDATE DailyTask
      SET status = @status, updatedAt = @updatedAt
      WHERE id = @id
    `)
    stmt.run({ id, status, updatedAt: now })
    
    // Return updated task
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async updatePersist(id: string, isPersist: boolean) {
    const now = Date.now()
    const stmt = db.prepare(`
      UPDATE DailyTask
      SET isPersist = @isPersist, updatedAt = @updatedAt
      WHERE id = @id
    `)
    stmt.run({ id, isPersist: isPersist ? 1 : 0, updatedAt: now })
    
    // Return updated task
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async deleteTask(id: string) {
    const task = db.prepare('SELECT * FROM DailyTask WHERE id = ?').get(id) as any
    if (!task) return null

    db.prepare('DELETE FROM DailyTask WHERE id = ?').run(id)

    return {
      ...task,
      isPersist: Boolean(task.isPersist),
      createdAt: new Date(task.createdAt),
      updatedAt: new Date(task.updatedAt),
      planDate: task.planDate ? new Date(task.planDate) : null
    }
  }

  static async checkAndCreateRecurringTasks() {
    // 1. Get all recurring tasks
    const recurringTasks = db.prepare('SELECT * FROM RecurringTask').all() as any[]
    if (recurringTasks.length === 0) return

    // 2. Get today's start and end time
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const todayTs = today.getTime()
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowTs = tomorrow.getTime()

    // 3. Batch query
    const placeholders = recurringTasks.map(() => '?').join(',')
    const existingTasks = db.prepare(`
      SELECT recurringTaskId FROM DailyTask
      WHERE recurringTaskId IN (${placeholders})
      AND createdAt >= ? AND createdAt < ?
    `).all(...recurringTasks.map(rt => rt.id), todayTs, tomorrowTs) as any[]

    const existingRecurringIds = new Set(existingTasks.map(t => t.recurringTaskId))

    // 4. Filter
    const tasksToCreate = recurringTasks
      .filter(rt => !existingRecurringIds.has(rt.id))
      .map(rt => ({
        id: randomUUID(),
        content: rt.content,
        status: 'PENDING',
        type: 'TODAY',
        recurringTaskId: rt.id,
        isPersist: 0,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }))

    if (tasksToCreate.length > 0) {
      const insert = db.prepare(`
        INSERT INTO DailyTask (id, content, status, type, recurringTaskId, isPersist, createdAt, updatedAt)
        VALUES (@id, @content, @status, @type, @recurringTaskId, @isPersist, @createdAt, @updatedAt)
      `)
      
      const insertMany = db.transaction((tasks) => {
        for (const task of tasks) insert.run(task)
      })
      
      insertMany(tasksToCreate)
    }
  }
}
