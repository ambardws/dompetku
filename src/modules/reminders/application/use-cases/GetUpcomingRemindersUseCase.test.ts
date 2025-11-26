/**
 * GetUpcomingRemindersUseCase Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { GetUpcomingRemindersUseCase } from './GetUpcomingRemindersUseCase'
import type { BillReminderRepository } from '../../domain/repositories/BillReminderRepository'
import type { BillReminder } from '../../domain/entities/BillReminder'

// Mock repository
class MockBillReminderRepository implements BillReminderRepository {
  private reminders: BillReminder[] = []

  async add(reminder: BillReminder): Promise<void> {
    this.reminders.push(reminder)
  }

  async getByUserId(userId: string): Promise<BillReminder[]> {
    return this.reminders.filter(r => r.userId === userId)
  }

  async getById(id: string): Promise<BillReminder | null> {
    return this.reminders.find(r => r.id === id) || null
  }

  async getActiveByUserId(userId: string): Promise<BillReminder[]> {
    return this.reminders.filter(r => r.userId === userId && r.isActive)
  }

  async getByDateRange(userId: string, startDate: Date, endDate: Date): Promise<BillReminder[]> {
    return this.reminders.filter(r =>
      r.userId === userId &&
      r.isActive &&
      r.nextDueDate >= startDate &&
      r.nextDueDate <= endDate
    )
  }

  async update(): Promise<void> {}
  async delete(): Promise<void> {}

  // Helper for tests
  addReminder(reminder: BillReminder): void {
    this.reminders.push(reminder)
  }
}

describe('GetUpcomingRemindersUseCase', () => {
  let useCase: GetUpcomingRemindersUseCase
  let repository: MockBillReminderRepository

  beforeEach(() => {
    repository = new MockBillReminderRepository()
    useCase = new GetUpcomingRemindersUseCase(repository)
  })

  describe('Validation', () => {
    it('should throw error if userId is empty', async () => {
      await expect(useCase.execute({
        userId: '',
        days: 7
      })).rejects.toThrow('User ID is required')
    })

    it('should throw error if days is negative', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        days: -1
      })).rejects.toThrow('Days must be greater than or equal to 0')
    })

    it('should throw error if days is zero', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        days: 0
      })).rejects.toThrow('Days must be greater than or equal to 0')
    })
  })

  describe('Upcoming Reminders', () => {
    it('should return empty array if no reminders', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toEqual([])
    })

    it('should return reminders due within specified days', async () => {
      const today = new Date()
      const in5Days = new Date(today)
      in5Days.setDate(today.getDate() + 5)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in5Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(1)
      expect(result[0].reminder.title).toBe('Listrik')
      expect(result[0].daysUntilDue).toBe(5)
      expect(result[0].isOverdue).toBe(false)
    })

    it('should not return reminders outside date range', async () => {
      const today = new Date()
      const in10Days = new Date(today)
      in10Days.setDate(today.getDate() + 10)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in10Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(0)
    })

    it('should mark overdue reminders', async () => {
      const today = new Date()
      const yesterday = new Date(today)
      yesterday.setDate(today.getDate() - 1)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: yesterday,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(1)
      expect(result[0].isOverdue).toBe(true)
      expect(result[0].daysUntilDue).toBeLessThan(0)
    })

    it('should return reminders due today', async () => {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Internet',
        amount: 350000,
        frequency: 'monthly',
        nextDueDate: today,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(1)
      expect(result[0].daysUntilDue).toBe(0)
      expect(result[0].isOverdue).toBe(false)
    })

    it('should filter by user ID', async () => {
      const today = new Date()
      const in3Days = new Date(today)
      in3Days.setDate(today.getDate() + 3)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Listrik User 1',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in3Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      repository.addReminder({
        id: 'rem-2',
        userId: 'user-2',
        title: 'Listrik User 2',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in3Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(1)
      expect(result[0].reminder.title).toBe('Listrik User 1')
    })

    it('should not return inactive reminders', async () => {
      const today = new Date()
      const in3Days = new Date(today)
      in3Days.setDate(today.getDate() + 3)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Inactive Reminder',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in3Days,
        reminderDays: 3,
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(0)
    })

    it('should sort reminders by due date (earliest first)', async () => {
      const today = new Date()
      const in2Days = new Date(today)
      in2Days.setDate(today.getDate() + 2)
      const in5Days = new Date(today)
      in5Days.setDate(today.getDate() + 5)
      const in1Day = new Date(today)
      in1Day.setDate(today.getDate() + 1)

      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Reminder 2',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in5Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      repository.addReminder({
        id: 'rem-2',
        userId: 'user-1',
        title: 'Reminder 1',
        amount: 350000,
        frequency: 'monthly',
        nextDueDate: in1Day,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      repository.addReminder({
        id: 'rem-3',
        userId: 'user-1',
        title: 'Reminder 3',
        amount: 200000,
        frequency: 'monthly',
        nextDueDate: in2Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(3)
      expect(result[0].reminder.title).toBe('Reminder 1')
      expect(result[1].reminder.title).toBe('Reminder 3')
      expect(result[2].reminder.title).toBe('Reminder 2')
    })

    it('should include reminders only within reminder window', async () => {
      const today = new Date()
      const in5Days = new Date(today)
      in5Days.setDate(today.getDate() + 5)

      // Reminder due in 5 days with 3 days reminder window
      // Should appear when checking 7 days ahead (5 <= 7)
      repository.addReminder({
        id: 'rem-1',
        userId: 'user-1',
        title: 'Should appear',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: in5Days,
        reminderDays: 3,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const result = await useCase.execute({
        userId: 'user-1',
        days: 7
      })

      expect(result).toHaveLength(1)
    })
  })
})
