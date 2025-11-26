/**
 * Unit Tests for SearchTransactionsUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SearchTransactionsUseCase } from './SearchTransactionsUseCase'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { SearchTransactionsInput, Transaction } from '../../domain/entities/Transaction'

describe('SearchTransactionsUseCase', () => {
  let mockRepository: TransactionRepository
  let useCase: SearchTransactionsUseCase

  const mockTransactions: Transaction[] = [
    {
      id: '1',
      userId: 'user-123',
      type: 'expense',
      amount: 50000,
      category: 'Makan',
      categoryId: 'cat-food',
      note: 'Lunch with team',
      createdAt: new Date('2024-01-15')
    },
    {
      id: '2',
      userId: 'user-123',
      type: 'income',
      amount: 5000000,
      category: 'Gaji',
      categoryId: 'cat-salary',
      note: 'Monthly salary',
      createdAt: new Date('2024-01-01')
    },
    {
      id: '3',
      userId: 'user-123',
      type: 'expense',
      amount: 25000,
      category: 'Transport',
      categoryId: 'cat-transport',
      note: 'Taxi to office',
      createdAt: new Date('2024-01-10')
    },
    {
      id: '4',
      userId: 'user-123',
      type: 'expense',
      amount: 150000,
      category: 'Makan',
      categoryId: 'cat-food',
      note: 'Dinner at restaurant',
      createdAt: new Date('2024-01-20')
    }
  ]

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn().mockResolvedValue(mockTransactions)
    }
    useCase = new SearchTransactionsUseCase(mockRepository)
  })

  describe('execute', () => {
    const validInput: SearchTransactionsInput = {
      userId: 'user-123'
    }

    it('should search transactions with userId only', async () => {
      const result = await useCase.execute(validInput)

      expect(mockRepository.search).toHaveBeenCalledWith(validInput)
      expect(result).toEqual(mockTransactions)
    })

    it('should search with text query', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        query: 'lunch'
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by type (expense)', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        type: 'expense'
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by type (income)', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        type: 'income'
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by categoryId', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        categoryId: 'cat-food'
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by date range', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        dateFrom: new Date('2024-01-10'),
        dateTo: new Date('2024-01-20')
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by amount range', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        amountMin: 50000,
        amountMax: 200000
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by minimum amount only', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        amountMin: 100000
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should filter by maximum amount only', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        amountMax: 100000
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should combine multiple filters', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        query: 'makan',
        type: 'expense',
        categoryId: 'cat-food',
        dateFrom: new Date('2024-01-01'),
        dateTo: new Date('2024-01-31'),
        amountMin: 50000,
        amountMax: 200000
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should throw error when type is invalid', async () => {
      const input = { ...validInput, type: 'invalid' as any }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid transaction type')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should throw error when amountMin is negative', async () => {
      const input = { ...validInput, amountMin: -1000 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount min must be greater than or equal to 0')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should throw error when amountMax is negative', async () => {
      const input = { ...validInput, amountMax: -1000 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount max must be greater than or equal to 0')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should throw error when amountMin is greater than amountMax', async () => {
      const input = {
        ...validInput,
        amountMin: 200000,
        amountMax: 100000
      }

      await expect(useCase.execute(input)).rejects.toThrow('Amount min cannot be greater than amount max')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should throw error when dateFrom is after dateTo', async () => {
      const input = {
        ...validInput,
        dateFrom: new Date('2024-01-31'),
        dateTo: new Date('2024-01-01')
      }

      await expect(useCase.execute(input)).rejects.toThrow('Date from cannot be after date to')
      expect(mockRepository.search).not.toHaveBeenCalled()
    })

    it('should allow amountMin equal to amountMax', async () => {
      const input = {
        ...validInput,
        amountMin: 100000,
        amountMax: 100000
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should allow dateFrom equal to dateTo (same day)', async () => {
      const sameDate = new Date('2024-01-15')
      const input = {
        ...validInput,
        dateFrom: sameDate,
        dateTo: sameDate
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith(input)
    })

    it('should trim query string', async () => {
      const input: SearchTransactionsInput = {
        userId: 'user-123',
        query: '  lunch  '
      }

      await useCase.execute(input)

      expect(mockRepository.search).toHaveBeenCalledWith({
        userId: 'user-123',
        query: 'lunch'
      })
    })

    it('should return empty array when repository returns empty', async () => {
      mockRepository.search = vi.fn().mockResolvedValue([])

      const result = await useCase.execute(validInput)

      expect(result).toEqual([])
    })
  })
})
