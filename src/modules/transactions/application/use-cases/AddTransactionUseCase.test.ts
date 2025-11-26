/**
 * Unit Tests for AddTransactionUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AddTransactionUseCase } from './AddTransactionUseCase'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { CreateTransactionInput } from '../../domain/entities/Transaction'

describe('AddTransactionUseCase', () => {
  let mockRepository: TransactionRepository
  let useCase: AddTransactionUseCase

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn(),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn()
    }
    useCase = new AddTransactionUseCase(mockRepository)
  })

  describe('execute', () => {
    const validInput: CreateTransactionInput = {
      userId: 'user-123',
      type: 'expense',
      amount: 50000,
      category: 'Makan',
      note: 'Lunch'
    }

    it('should create transaction with valid input', async () => {
      const result = await useCase.execute(validInput)

      expect(result).toMatchObject({
        userId: 'user-123',
        type: 'expense',
        amount: 50000,
        category: 'Makan',
        note: 'Lunch'
      })
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(mockRepository.add).toHaveBeenCalledWith(result)
    })

    it('should create income transaction', async () => {
      const input: CreateTransactionInput = {
        ...validInput,
        type: 'income',
        category: 'Gaji'
      }

      const result = await useCase.execute(input)

      expect(result.type).toBe('income')
      expect(result.category).toBe('Gaji')
    })

    it('should create transaction without note', async () => {
      const input: CreateTransactionInput = {
        userId: 'user-123',
        type: 'expense',
        amount: 20000,
        category: 'Transport'
      }

      const result = await useCase.execute(input)

      expect(result.note).toBeUndefined()
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

    it('should throw error when amount is negative', async () => {
      const input = { ...validInput, amount: -1000 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when category is empty', async () => {
      const input = { ...validInput, category: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Category is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when category is only whitespace', async () => {
      const input = { ...validInput, category: '   ' }

      await expect(useCase.execute(input)).rejects.toThrow('Category is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should generate unique IDs for different transactions', async () => {
      const result1 = await useCase.execute(validInput)
      const result2 = await useCase.execute(validInput)

      expect(result1.id).not.toBe(result2.id)
    })
  })
})
