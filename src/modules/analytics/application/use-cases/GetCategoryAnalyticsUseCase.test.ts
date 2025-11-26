import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCategoryAnalyticsUseCase } from './GetCategoryAnalyticsUseCase'
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { CategoryRepository } from '~modules/categories/domain/repositories/CategoryRepository'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'
import type { Category } from '~modules/categories/domain/entities/Category'

describe('GetCategoryAnalyticsUseCase', () => {
  let useCase: GetCategoryAnalyticsUseCase
  let mockTransactionRepo: TransactionRepository
  let mockCategoryRepo: CategoryRepository

  beforeEach(() => {
    mockTransactionRepo = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    mockCategoryRepo = {
      add: vi.fn(),
      getByUserId: vi.fn(),
      getByUserIdAndType: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      initializeDefaultCategories: vi.fn(),
    }
    useCase = new GetCategoryAnalyticsUseCase(mockTransactionRepo, mockCategoryRepo)
  })

  describe('Validation', () => {
    it('should reject empty userId', async () => {
      const input = {
        userId: '',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
    })

    it('should reject invalid date range', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-31'),
        to: new Date('2024-01-01'),
      }

      await expect(useCase.execute(input)).rejects.toThrow(
        'Invalid date range: from date must be before to date'
      )
    })
  })

  describe('Analytics Calculation', () => {
    it('should calculate analytics for empty transactions', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue([])
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue([])

      const result = await useCase.execute(input)

      expect(result.totalIncome).toBe(0)
      expect(result.totalExpense).toBe(0)
      expect(result.balance).toBe(0)
      expect(result.incomeByCategory).toHaveLength(0)
      expect(result.expenseByCategory).toHaveLength(0)
    })

    it('should calculate total income and expense', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          userId: 'user-123',
          type: 'income',
          amount: 5000000,
          category: 'Salary',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 't2',
          userId: 'user-123',
          type: 'expense',
          amount: 100000,
          category: 'Food',
          categoryId: 'cat-2',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 't3',
          userId: 'user-123',
          type: 'expense',
          amount: 50000,
          category: 'Transport',
          categoryId: 'cat-3',
          createdAt: new Date('2024-01-03'),
        },
      ]

      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          userId: 'user-123',
          name: 'Salary',
          icon: '💰',
          color: '#4CAF50',
          type: 'income',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          userId: 'user-123',
          name: 'Food',
          icon: '🍔',
          color: '#FF5733',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-3',
          userId: 'user-123',
          name: 'Transport',
          icon: '🚗',
          color: '#2196F3',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue(mockTransactions)
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue(mockCategories)

      const result = await useCase.execute(input)

      expect(result.totalIncome).toBe(5000000)
      expect(result.totalExpense).toBe(150000)
      expect(result.balance).toBe(4850000)
    })

    it('should group transactions by category', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          userId: 'user-123',
          type: 'expense',
          amount: 100000,
          category: 'Food',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 't2',
          userId: 'user-123',
          type: 'expense',
          amount: 50000,
          category: 'Food',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-02'),
        },
        {
          id: 't3',
          userId: 'user-123',
          type: 'expense',
          amount: 75000,
          category: 'Transport',
          categoryId: 'cat-2',
          createdAt: new Date('2024-01-03'),
        },
      ]

      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          userId: 'user-123',
          name: 'Food',
          icon: '🍔',
          color: '#FF5733',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          userId: 'user-123',
          name: 'Transport',
          icon: '🚗',
          color: '#2196F3',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue(mockTransactions)
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue(mockCategories)

      const result = await useCase.execute(input)

      expect(result.expenseByCategory).toHaveLength(2)

      const foodCategory = result.expenseByCategory.find((c) => c.categoryName === 'Food')
      expect(foodCategory?.totalAmount).toBe(150000)
      expect(foodCategory?.transactionCount).toBe(2)

      const transportCategory = result.expenseByCategory.find(
        (c) => c.categoryName === 'Transport'
      )
      expect(transportCategory?.totalAmount).toBe(75000)
      expect(transportCategory?.transactionCount).toBe(1)
    })

    it('should calculate percentages correctly', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          userId: 'user-123',
          type: 'expense',
          amount: 60000,
          category: 'Food',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 't2',
          userId: 'user-123',
          type: 'expense',
          amount: 40000,
          category: 'Transport',
          categoryId: 'cat-2',
          createdAt: new Date('2024-01-02'),
        },
      ]

      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          userId: 'user-123',
          name: 'Food',
          icon: '🍔',
          color: '#FF5733',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          userId: 'user-123',
          name: 'Transport',
          icon: '🚗',
          color: '#2196F3',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue(mockTransactions)
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue(mockCategories)

      const result = await useCase.execute(input)

      const foodCategory = result.expenseByCategory.find((c) => c.categoryName === 'Food')
      expect(foodCategory?.percentage).toBe(60) // 60000/100000 * 100

      const transportCategory = result.expenseByCategory.find(
        (c) => c.categoryName === 'Transport'
      )
      expect(transportCategory?.percentage).toBe(40) // 40000/100000 * 100
    })

    it('should identify top expense category', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          userId: 'user-123',
          type: 'expense',
          amount: 100000,
          category: 'Food',
          categoryId: 'cat-1',
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 't2',
          userId: 'user-123',
          type: 'expense',
          amount: 50000,
          category: 'Transport',
          categoryId: 'cat-2',
          createdAt: new Date('2024-01-02'),
        },
      ]

      const mockCategories: Category[] = [
        {
          id: 'cat-1',
          userId: 'user-123',
          name: 'Food',
          icon: '🍔',
          color: '#FF5733',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'cat-2',
          userId: 'user-123',
          name: 'Transport',
          icon: '🚗',
          color: '#2196F3',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue(mockTransactions)
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue(mockCategories)

      const result = await useCase.execute(input)

      expect(result.topExpenseCategory?.categoryName).toBe('Food')
      expect(result.topExpenseCategory?.totalAmount).toBe(100000)
    })

    it('should handle transactions without categoryId (legacy)', async () => {
      const input = {
        userId: 'user-123',
        from: new Date('2024-01-01'),
        to: new Date('2024-01-31'),
      }

      const mockTransactions: Transaction[] = [
        {
          id: 't1',
          userId: 'user-123',
          type: 'expense',
          amount: 100000,
          category: 'Food & Dining',
          categoryId: undefined,
          createdAt: new Date('2024-01-01'),
        },
      ]

      vi.mocked(mockTransactionRepo.getByPeriod).mockResolvedValue(mockTransactions)
      vi.mocked(mockCategoryRepo.getByUserId).mockResolvedValue([])

      const result = await useCase.execute(input)

      expect(result.expenseByCategory).toHaveLength(1)
      expect(result.expenseByCategory[0].categoryName).toBe('Food & Dining')
      expect(result.expenseByCategory[0].totalAmount).toBe(100000)
    })
  })
})
