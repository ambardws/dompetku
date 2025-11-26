/**
 * CreateBillReminderUseCase Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { CreateBillReminderUseCase } from './CreateBillReminderUseCase'
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

  async getByDateRange(): Promise<BillReminder[]> {
    return []
  }

  async update(): Promise<void> {}
  async delete(): Promise<void> {}

  getAll(): BillReminder[] {
    return this.reminders
  }
}

describe('CreateBillReminderUseCase', () => {
  let useCase: CreateBillReminderUseCase
  let repository: MockBillReminderRepository

  beforeEach(() => {
    repository = new MockBillReminderRepository()
    useCase = new CreateBillReminderUseCase(repository)
  })

  describe('Validation', () => {
    it('should throw error if userId is empty', async () => {
      await expect(useCase.execute({
        userId: '',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })).rejects.toThrow('User ID is required')
    })

    it('should throw error if title is empty', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        title: '',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })).rejects.toThrow('Title is required')
    })

    it('should throw error if amount is zero', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: 0,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })).rejects.toThrow('Amount must be greater than 0')
    })

    it('should throw error if amount is negative', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: -100,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })).rejects.toThrow('Amount must be greater than 0')
    })

    it('should throw error if frequency is invalid', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'invalid' as any,
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })).rejects.toThrow('Invalid frequency')
    })

    it('should throw error if reminderDays is negative', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: -1
      })).rejects.toThrow('Reminder days cannot be negative')
    })
  })

  describe('Bill Reminder Creation', () => {
    it('should create a monthly bill reminder', async () => {
      const nextDueDate = new Date('2025-12-01')
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Listrik PLN',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate,
        reminderDays: 3
      })

      expect(result).toBeDefined()
      expect(result.id).toBeDefined()
      expect(result.userId).toBe('user-1')
      expect(result.title).toBe('Listrik PLN')
      expect(result.amount).toBe(500000)
      expect(result.frequency).toBe('monthly')
      expect(result.nextDueDate).toEqual(nextDueDate)
      expect(result.reminderDays).toBe(3)
      expect(result.isActive).toBe(true)
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should create yearly bill reminder', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Pajak Kendaraan',
        amount: 2000000,
        frequency: 'yearly',
        nextDueDate: new Date('2026-06-15'),
        reminderDays: 30
      })

      expect(result.frequency).toBe('yearly')
      expect(result.reminderDays).toBe(30)
    })

    it('should create weekly bill reminder', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Subscription Service',
        amount: 50000,
        frequency: 'weekly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 1
      })

      expect(result.frequency).toBe('weekly')
    })

    it('should create bill reminder with category', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Internet',
        amount: 350000,
        categoryId: 'cat-utilities',
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-05'),
        reminderDays: 3
      })

      expect(result.categoryId).toBe('cat-utilities')
    })

    it('should create bill reminder with notes', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'BPJS Kesehatan',
        amount: 150000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-10'),
        reminderDays: 5,
        notes: 'Bayar via aplikasi Mobile JKN'
      })

      expect(result.notes).toBe('Bayar via aplikasi Mobile JKN')
    })

    it('should create bill reminder without notes', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Air PDAM',
        amount: 100000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-15'),
        reminderDays: 2
      })

      expect(result.notes).toBeUndefined()
    })

    it('should allow zero reminder days (remind on due date)', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        title: 'Cicilan',
        amount: 1000000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-20'),
        reminderDays: 0
      })

      expect(result.reminderDays).toBe(0)
    })
  })

  describe('Repository Integration', () => {
    it('should save reminder to repository', async () => {
      await useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })

      const reminders = repository.getAll()
      expect(reminders).toHaveLength(1)
      expect(reminders[0].title).toBe('Listrik')
    })

    it('should allow multiple reminders for same user', async () => {
      await useCase.execute({
        userId: 'user-1',
        title: 'Listrik',
        amount: 500000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-01'),
        reminderDays: 3
      })

      await useCase.execute({
        userId: 'user-1',
        title: 'Internet',
        amount: 350000,
        frequency: 'monthly',
        nextDueDate: new Date('2025-12-05'),
        reminderDays: 3
      })

      const reminders = repository.getAll()
      expect(reminders).toHaveLength(2)
    })
  })
})
