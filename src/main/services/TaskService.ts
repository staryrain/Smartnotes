import { prisma } from '../db'

export class TaskService {
  static async getTasks() {
    // 1. Get today's start
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // 2. Query: tasks created today OR tasks marked as persist (from previous days)
    return prisma.dailyTask.findMany({
      where: {
        type: 'TODAY',
        OR: [
          { createdAt: { gte: today } },
          { isPersist: true }
        ]
      },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async createTask(content: string, longTermId?: string) {
    return prisma.dailyTask.create({
      data: {
        content,
        status: 'PENDING',
        type: 'TODAY',
        longTermId
      }
    })
  }

  static async updateStatus(id: string, status: string) {
    return prisma.dailyTask.update({
      where: { id },
      data: { status }
    })
  }

  static async updatePersist(id: string, isPersist: boolean) {
    return prisma.dailyTask.update({
      where: { id },
      data: { isPersist }
    })
  }

  static async deleteTask(id: string) {
    return prisma.dailyTask.delete({
      where: { id }
    })
  }

  static async checkAndCreateRecurringTasks() {
    // 1. Get all recurring tasks (subtasks of long term goals)
    const recurringTasks = await prisma.recurringTask.findMany()

    if (recurringTasks.length === 0) return

    // 2. Get today's start and end time
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // 3. Batch query: Get all daily tasks for today that are linked to recurring tasks
    const existingTasks = await prisma.dailyTask.findMany({
      where: {
        recurringTaskId: { in: recurringTasks.map(rt => rt.id) },
        createdAt: {
          gte: today,
          lt: tomorrow
        }
      },
      select: { recurringTaskId: true }
    })

    const existingRecurringIds = new Set(existingTasks.map(t => t.recurringTaskId))

    // 4. Filter and create missing tasks
    const tasksToCreate = recurringTasks
      .filter(rt => !existingRecurringIds.has(rt.id))
      .map(rt => ({
        content: rt.content,
        status: 'PENDING',
        type: 'TODAY',
        recurringTaskId: rt.id
      }))

    if (tasksToCreate.length > 0) {
      await prisma.dailyTask.createMany({
        data: tasksToCreate
      })
    }
  }
}
