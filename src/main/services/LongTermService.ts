import { prisma } from '../db'

export class LongTermService {
  static async getGoals() {
    return prisma.longTermGoal.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        subtasks: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })
  }

  static async createGoal(content: string) {
    return prisma.longTermGoal.create({
      data: {
        content,
        status: 'PENDING'
      }
    })
  }

  static async updateStatus(id: string, status: string) {
    return prisma.longTermGoal.update({
      where: { id },
      data: { status }
    })
  }

  static async deleteGoal(id: string) {
    return prisma.longTermGoal.delete({
      where: { id }
    })
  }

  static async createSubtask(longTermId: string, content: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Create the recurring task definition
      const recurring = await tx.recurringTask.create({
        data: {
          content,
          longTermGoalId: longTermId
        }
      })

      // 2. Immediately create a daily task for today
      await tx.dailyTask.create({
        data: {
          content,
          status: 'PENDING',
          type: 'TODAY',
          recurringTaskId: recurring.id
        }
      })

      return recurring
    })
  }

  static async deleteSubtask(id: string) {
    return prisma.recurringTask.delete({
      where: { id }
    })
  }
}
