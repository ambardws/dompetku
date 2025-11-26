/**
 * Unit Tests for GetTrendDataUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetTrendDataUseCase } from './GetTrendDataUseCase'
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'
import type { GetTrendDataInput } from '../../domain/entities/TrendData'
import type { Transaction } from '~modules/transactions/domain/entities/Transaction'

describe('GetTrendDataUseCase', () => {
  let mockRepository: TransactionRepository
  let useCase: GetTrendDataUseCase

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn()
    }
    useCase = new GetTrendDataUseCase(mockRepository)
  })

  describe('execute - monthly period', () => {
    const validInput: GetTrendDataInput = {
      userId: 'user-123',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-03-31'),
      period: 'monthly'
    }

    it('should aggregate transactions by month', async () => {
      const transactions: Transaction[] = [
        {
          id: '1',
          userId: 'user-123',
          type: 'income',
          amount: 5000000,
          category: 'Gaji',
          createdAt: new Date('2024-01-15')
        },
        {
          id: '2',
          userId: 'user-123',
          type: 'expense',
          amount: 1000000,
          category: 'Makan',
          createdAt: new Date('2024-01-20')
        },
        {
          id: '3',
          userId: 'user-123',
          type: 'income',
          amount: 5000000,
          category: 'Gaji',
          createdAt: new Date('2024-02-15')
        }
      ]

      mockRepository.getByPeriod = vi.fn().mockResolvedValue(transactions)

      const result = await useCase.execute(validInput)

      expect(result.period).toBe('monthly')
      expect(result.dataPoints).toHaveLength(3) // Jan, Feb, Mar
      expect(result.dataPoints[0]).toEqual({
        date: '2024-01',
        income: 5000000,
        expense: 1000000,
        balance: 4000000
      })
    })

    it('should include months with no transactions', async () => {
      mockRepository.getByPeriod = vi.fn().mockResolvedValue([])

      const result = await useCase.execute(validInput)

      expect(result.dataPoints).toHaveLength(3) // Jan, Feb, Mar all zeros
      expect(result.dataPoints[0]).toEqual({
        date: '2024-01',
        income: 0,
        expense: 0,
        balance: 0
      })
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
    })

    it('should throw error when period is invalid', async () => {
      const input = { ...validInput, period: 'yearly' as any }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid period')
    })
  })
})
