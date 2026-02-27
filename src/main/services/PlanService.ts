import { prisma } from '../db'

export class PlanService {
  static async getPlans() {
    return prisma.dailyTask.findMany({
      where: { type: 'PLAN_TOMORROW' },
      orderBy: { createdAt: 'desc' }
    })
  }

  static async createPlan(content: string) {
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(6, 0, 0, 0)

    return prisma.dailyTask.create({
      data: {
        content,
        status: 'PENDING',
        type: 'PLAN_TOMORROW',
        planDate: tomorrow
      }
    })
  }

  static async deletePlan(id: string) {
    return prisma.dailyTask.delete({
      where: { id }
    })
  }

  static async checkAndMovePlans() {
    const now = new Date()
    // Move plans that are due
    await prisma.dailyTask.updateMany({
      where: {
        type: 'PLAN_TOMORROW',
        planDate: {
          lte: now
        }
      },
      data: {
        type: 'TODAY',
        planDate: null // Clear it or keep it as history
      }
    })
  }
}
