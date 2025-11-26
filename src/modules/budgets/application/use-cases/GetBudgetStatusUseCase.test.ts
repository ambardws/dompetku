/**
 * Unit Tests for GetBudgetStatusUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetBudgetStatusUseCase } from './GetBudgetStatusUseCase'
import type { BudgetRepository } from '../../domain/repositories/BudgetRepository'
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { Budget, GetBudgetStatusInput } from '../../domain/entities/Budget'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'

describe('GetBudgetStatusUseCase', () => {
  let mockBudgetRepository: BudgetRepository
  let mockTransactionRepository: TransactionRepository
  let useCase: GetBudgetStatusUseCase

  const mockBudget: Budget = {
    id: 'budget-123',
    userId: 'user-123',
    categoryId: 'cat-food',
    amount: 1000000,
    period: 'monthly',
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
  }

  beforeEach(() => {
    mockBudgetRepository = {
      add: vi.fn(),
      getByUserId: vi.fn(),
      getByCategoryId: vi.fn().mockResolvedValue(mockBudget),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }

    mockTransactionRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn()
    }

    useCase = new GetBudgetStatusUseCase(mockBudgetRepository, mockTransactionRepository)
  })

  describe('execute', () => {
    const validInput: GetBudgetStatusInput = {
      userId: 'user-123',
      categoryId: 'cat-food',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-31')
    }

    it('should return safe status when spending is under 80%', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 500000, // 50% of budget
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-15')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.budget).toEqual(mockBudget)
      expect(result.spent).toBe(500000)
      expect(result.remaining).toBe(500000)
      expect(result.percentage).toBe(50)
      expect(result.status).toBe('safe')
    })

    it('should return warning status when spending is between 80-100%', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 850000, // 85% of budget
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-15')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.spent).toBe(850000)
      expect(result.remaining).toBe(150000)
      expect(result.percentage).toBe(85)
      expect(result.status).toBe('warning')
    })

    it('should return exceeded status when spending is over 100%', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 1200000, // 120% of budget
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-15')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.spent).toBe(1200000)
      expect(result.remaining).toBe(-200000)
      expect(result.percentage).toBe(120)
      expect(result.status).toBe('exceeded')
    })

    it('should return warning status exactly at 80%', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 800000, // Exactly 80%
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-15')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.percentage).toBe(80)
      expect(result.status).toBe('warning')
    })

    it('should return exceeded status exactly at 100%', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 1000000, // Exactly 100%
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-15')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.percentage).toBe(100)
      expect(result.status).toBe('exceeded')
    })

    it('should sum multiple transactions', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'expense',
          amount: 300000,
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-10')
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'expense',
          amount: 400000,
          category: 'Makan',
          categoryId: 'cat-food',
          createdAt: new Date('2024-01-20')
        }
      ]

      mockTransactionRepository.search = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.spent).toBe(700000)
      expect(result.percentage).toBe(70)
    })

    it('should return 0 spent when no transactions', async () => {
      mockTransactionRepository.search = vi.fn().mockResolvedValue([])

      const result = await useCase.execute(validInput)

      expect(result.spent).toBe(0)
      expect(result.remaining).toBe(1000000)
      expect(result.percentage).toBe(0)
      expect(result.status).toBe('safe')
    })

    it('should throw error when no budget exists for category', async () => {
      mockBudgetRepository.getByCategoryId = vi.fn().mockResolvedValue(null)

      await expect(useCase.execute(validInput)).rejects.toThrow('No budget found for this category')
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
    })

    it('should throw error when categoryId is missing', async () => {
      const input = { ...validInput, categoryId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Category ID is required')
    })

    it('should throw error when startDate is missing', async () => {
      const input = { ...validInput, startDate: null as any }

      await expect(useCase.execute(input)).rejects.toThrow('Start date is required')
    })

    it('should throw error when endDate is missing', async () => {
      const input = { ...validInput, endDate: null as any }

      await expect(useCase.execute(input)).rejects.toThrow('End date is required')
    })

    it('should throw error when startDate is after endDate', async () => {
      const input = {
        ...validInput,
        startDate: new Date('2024-01-31'),
        endDate: new Date('2024-01-01')
      }

      await expect(useCase.execute(input)).rejects.toThrow('Start date must be before or equal to end date')
    })

    it('should call search with correct parameters', async () => {
      mockTransactionRepository.search = vi.fn().mockResolvedValue([])

      await useCase.execute(validInput)

      expect(mockTransactionRepository.search).toHaveBeenCalledWith({
        userId: 'user-123',
        categoryId: 'cat-food',
        type: 'expense',
        dateFrom: validInput.startDate,
        dateTo: validInput.endDate
      })
    })
  })
})
