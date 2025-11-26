/**
 * Unit Tests for GetTransactionsByPeriodUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTransactionsByPeriodUseCase } from './GetTransactionsByPeriodUseCase'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { Transaction } from '../../domain/entities/Transaction'

describe('GetTransactionsByPeriodUseCase', () => {
  let mockRepository: TransactionRepository
  let useCase: GetTransactionsByPeriodUseCase

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn()
    }
    useCase = new GetTransactionsByPeriodUseCase(mockRepository)
  })

  describe('execute', () => {
    const userId = 'user-123'
    const from = new Date('2025-01-01')
    const to = new Date('2025-01-31')

    const mockTransactions: Transaction[] = [
      {
        id: '1',
        userId,
        type: 'expense',
        amount: 25000,
        category: 'Makan',
        createdAt: new Date('2025-01-15')
      },
      {
        id: '2',
        userId,
        type: 'income',
        amount: 5000000,
        category: 'Gaji',
        createdAt: new Date('2025-01-01')
      },
      {
        id: '3',
        userId,
        type: 'expense',
        amount: 50000,
        category: 'Transport',
        createdAt: new Date('2025-01-20')
      }
    ]

    it('should retrieve transactions for valid period', async () => {
      vi.mocked(mockRepository.getByPeriod).mockResolvedValue(mockTransactions)

      const result = await useCase.execute({ userId, from, to })

      expect(mockRepository.getByPeriod).toHaveBeenCalledWith(userId, from, to)
      expect(result).toHaveLength(3)
    })

    it('should sort transactions by date descending (newest first)', async () => {
      vi.mocked(mockRepository.getByPeriod).mockResolvedValue(mockTransactions)

      const result = await useCase.execute({ userId, from, to })

      expect(result[0].id).toBe('3') // Jan 20
      expect(result[1].id).toBe('1') // Jan 15
      expect(result[2].id).toBe('2') // Jan 1
    })

    it('should return empty array when no transactions found', async () => {
      vi.mocked(mockRepository.getByPeriod).mockResolvedValue([])

      const result = await useCase.execute({ userId, from, to })

      expect(result).toEqual([])
    })

    it('should throw error when userId is missing', async () => {
      await expect(
        useCase.execute({ userId: '', from, to })
      ).rejects.toThrow('User ID is required')

      expect(mockRepository.getByPeriod).not.toHaveBeenCalled()
    })

    it('should throw error when from date is missing', async () => {
      await expect(
        useCase.execute({ userId, from: null as any, to })
      ).rejects.toThrow('Date range is required')

      expect(mockRepository.getByPeriod).not.toHaveBeenCalled()
    })

    it('should throw error when to date is missing', async () => {
      await expect(
        useCase.execute({ userId, from, to: null as any })
      ).rejects.toThrow('Date range is required')

      expect(mockRepository.getByPeriod).not.toHaveBeenCalled()
    })

    it('should throw error when from date is after to date', async () => {
      const invalidFrom = new Date('2025-02-01')
      const invalidTo = new Date('2025-01-01')

      await expect(
        useCase.execute({ userId, from: invalidFrom, to: invalidTo })
      ).rejects.toThrow('Start date must be before end date')

      expect(mockRepository.getByPeriod).not.toHaveBeenCalled()
    })

    it('should handle single day period', async () => {
      const singleDay = new Date('2025-01-15')
      vi.mocked(mockRepository.getByPeriod).mockResolvedValue([mockTransactions[0]])

      const result = await useCase.execute({ userId, from: singleDay, to: singleDay })

      expect(result).toHaveLength(1)
      expect(mockRepository.getByPeriod).toHaveBeenCalledWith(userId, singleDay, singleDay)
    })
  })
})
