/**
 * Unit Tests for CreateRecurringTransactionUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { CreateRecurringTransactionUseCase } from './CreateRecurringTransactionUseCase'
import type { RecurringTransactionRepository } from '../../domain/repositories/RecurringTransactionRepository'
import type { CreateRecurringTransactionInput } from '../../domain/entities/RecurringTransaction'

describe('CreateRecurringTransactionUseCase', () => {
  let mockRepository: RecurringTransactionRepository
  let useCase: CreateRecurringTransactionUseCase

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByUserId: vi.fn(),
      getActiveByUserId: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
    useCase = new CreateRecurringTransactionUseCase(mockRepository)
  })

  describe('execute', () => {
    const validInput: CreateRecurringTransactionInput = {
      userId: 'user-123',
      type: 'expense',
      amount: 500000,
      category: 'Subscription',
      categoryId: 'cat-sub',
      note: 'Netflix monthly',
      frequency: 'monthly',
      startDate: new Date('2024-01-01')
    }

    it('should create recurring transaction with valid input', async () => {
      const result = await useCase.execute(validInput)

      expect(result).toMatchObject({
        userId: 'user-123',
        type: 'expense',
        amount: 500000,
        category: 'Subscription',
        frequency: 'monthly',
        isActive: true
      })
      expect(result.id).toBeDefined()
      expect(result.nextDate).toEqual(validInput.startDate)
      expect(mockRepository.add).toHaveBeenCalledWith(result)
    })

    it('should set nextDate to startDate initially', async () => {
      const result = await useCase.execute(validInput)

      expect(result.nextDate).toEqual(validInput.startDate)
    })

    it('should set isActive to true by default', async () => {
      const result = await useCase.execute(validInput)

      expect(result.isActive).toBe(true)
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when type is invalid', async () => {
      const input = { ...validInput, type: 'invalid' as any }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid transaction type')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when amount is zero', async () => {
      const input = { ...validInput, amount: 0 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when category is empty', async () => {
      const input = { ...validInput, category: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Category is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when frequency is invalid', async () => {
      const input = { ...validInput, frequency: 'yearly' as any }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid frequency')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should create daily recurring transaction', async () => {
      const input = { ...validInput, frequency: 'daily' as const }

      const result = await useCase.execute(input)

      expect(result.frequency).toBe('daily')
    })

    it('should create weekly recurring transaction', async () => {
      const input = { ...validInput, frequency: 'weekly' as const }

      const result = await useCase.execute(input)

      expect(result.frequency).toBe('weekly')
    })
  })
})
