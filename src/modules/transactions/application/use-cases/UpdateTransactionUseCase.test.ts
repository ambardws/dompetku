/**
 * Unit Tests for UpdateTransactionUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateTransactionUseCase } from './UpdateTransactionUseCase'
import type { TransactionRepository } from '../../domain/repositories/TransactionRepository'
import type { UpdateTransactionInput } from '../../domain/entities/Transaction'
import type { Transaction } from '../../domain/entities/Transaction'

describe('UpdateTransactionUseCase', () => {
  let mockRepository: TransactionRepository
  let useCase: UpdateTransactionUseCase

  const existingTransaction: Transaction = {
    id: 'txn-123',
    userId: 'user-123',
    type: 'expense',
    amount: 50000,
    category: 'Makan',
    categoryId: 'cat-food',
    note: 'Lunch',
    createdAt: new Date('2024-01-15')
  }

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByPeriod: vi.fn(),
      getById: vi.fn().mockResolvedValue(existingTransaction),
      delete: vi.fn(),
      update: vi.fn(),
      search: vi.fn()
    }
    useCase = new UpdateTransactionUseCase(mockRepository)
  })

  describe('execute', () => {
    const validInput: UpdateTransactionInput = {
      id: 'txn-123',
      userId: 'user-123',
      amount: 75000,
      note: 'Dinner with friends'
    }

    it('should update transaction with valid input', async () => {
      await useCase.execute(validInput)

      expect(mockRepository.getById).toHaveBeenCalledWith('txn-123')
      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        amount: 75000,
        note: 'Dinner with friends'
      })
    })

    it('should update only amount field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        amount: 100000
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        amount: 100000
      })
    })

    it('should update only type field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        type: 'income'
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        type: 'income'
      })
    })

    it('should update only category field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        category: 'Transport'
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        category: 'Transport'
      })
    })

    it('should update only categoryId field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        categoryId: 'cat-transport'
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        categoryId: 'cat-transport'
      })
    })

    it('should update only note field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        note: 'Updated note'
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        note: 'Updated note'
      })
    })

    it('should update multiple fields at once', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        type: 'income',
        amount: 500000,
        category: 'Gaji',
        categoryId: 'cat-salary',
        note: 'Monthly salary'
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        type: 'income',
        amount: 500000,
        category: 'Gaji',
        categoryId: 'cat-salary',
        note: 'Monthly salary'
      })
    })

    it('should throw error when id is missing', async () => {
      const input = { ...validInput, id: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Transaction ID is required')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when transaction not found', async () => {
      mockRepository.getById = vi.fn().mockResolvedValue(null)

      await expect(useCase.execute(validInput)).rejects.toThrow('Transaction not found')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when userId does not match (authorization)', async () => {
      const input = { ...validInput, userId: 'different-user' }

      await expect(useCase.execute(input)).rejects.toThrow('Unauthorized to update this transaction')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when type is invalid', async () => {
      const input = { ...validInput, type: 'invalid' as any }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid transaction type')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when amount is zero', async () => {
      const input = { ...validInput, amount: 0 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when amount is negative', async () => {
      const input = { ...validInput, amount: -5000 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when category is empty string', async () => {
      const input = { ...validInput, category: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Category cannot be empty')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should throw error when category is only whitespace', async () => {
      const input = { ...validInput, category: '   ' }

      await expect(useCase.execute(input)).rejects.toThrow('Category cannot be empty')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should allow clearing note field', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123',
        note: ''
      }

      await useCase.execute(input)

      expect(mockRepository.update).toHaveBeenCalledWith('txn-123', {
        note: ''
      })
    })

    it('should not call update when no fields to update', async () => {
      const input: UpdateTransactionInput = {
        id: 'txn-123',
        userId: 'user-123'
      }

      await expect(useCase.execute(input)).rejects.toThrow('No fields to update')
      expect(mockRepository.update).not.toHaveBeenCalled()
    })
  })
})
