/**
 * Unit Tests for SetBudgetUseCase
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { SetBudgetUseCase } from './SetBudgetUseCase'
import type { BudgetRepository } from '../../domain/repositories/BudgetRepository'
import type { CreateBudgetInput, Budget } from '../../domain/entities/Budget'

describe('SetBudgetUseCase', () => {
  let mockRepository: BudgetRepository
  let useCase: SetBudgetUseCase

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByUserId: vi.fn(),
      getByCategoryId: vi.fn().mockResolvedValue(null),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn()
    }
    useCase = new SetBudgetUseCase(mockRepository)
  })

  describe('execute - create new budget', () => {
    const validInput: CreateBudgetInput = {
      userId: 'user-123',
      categoryId: 'cat-food',
      amount: 1000000
    }

    it('should create new budget with valid input', async () => {
      const result = await useCase.execute(validInput)

      expect(result).toMatchObject({
        userId: 'user-123',
        categoryId: 'cat-food',
        amount: 1000000,
        period: 'monthly'
      })
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(mockRepository.add).toHaveBeenCalledWith(result)
    })

    it('should use default period (monthly) if not provided', async () => {
      const result = await useCase.execute(validInput)

      expect(result.period).toBe('monthly')
    })

    it('should create budget with explicit period', async () => {
      const input: CreateBudgetInput = {
        ...validInput,
        period: 'monthly'
      }

      const result = await useCase.execute(input)

      expect(result.period).toBe('monthly')
    })

    it('should throw error when userId is missing', async () => {
      const input = { ...validInput, userId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when categoryId is missing', async () => {
      const input = { ...validInput, categoryId: '' }

      await expect(useCase.execute(input)).rejects.toThrow('Category ID is required')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when amount is zero', async () => {
      const input = { ...validInput, amount: 0 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should throw error when amount is negative', async () => {
      const input = { ...validInput, amount: -50000 }

      await expect(useCase.execute(input)).rejects.toThrow('Amount must be greater than 0')
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should generate unique IDs for different budgets', async () => {
      const result1 = await useCase.execute(validInput)
      const result2 = await useCase.execute({ ...validInput, categoryId: 'cat-transport' })

      expect(result1.id).not.toBe(result2.id)
    })
  })

  describe('execute - update existing budget', () => {
    const existingBudget: Budget = {
      id: 'budget-123',
      userId: 'user-123',
      categoryId: 'cat-food',
      amount: 1000000,
      period: 'monthly',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01')
    }

    beforeEach(() => {
      mockRepository.getByCategoryId = vi.fn().mockResolvedValue(existingBudget)
    })

    it('should update existing budget when category already has budget', async () => {
      const input: CreateBudgetInput = {
        userId: 'user-123',
        categoryId: 'cat-food',
        amount: 1500000
      }

      const result = await useCase.execute(input)

      expect(result.id).toBe('budget-123')
      expect(result.amount).toBe(1500000)
      expect(mockRepository.update).toHaveBeenCalledWith('budget-123', {
        amount: 1500000
      })
      expect(mockRepository.add).not.toHaveBeenCalled()
    })

    it('should maintain original createdAt when updating', async () => {
      const input: CreateBudgetInput = {
        userId: 'user-123',
        categoryId: 'cat-food',
        amount: 1500000
      }

      const result = await useCase.execute(input)

      expect(result.createdAt).toEqual(existingBudget.createdAt)
    })

    it('should update updatedAt timestamp', async () => {
      const input: CreateBudgetInput = {
        userId: 'user-123',
        categoryId: 'cat-food',
        amount: 1500000
      }

      const result = await useCase.execute(input)

      expect(result.updatedAt).toBeInstanceOf(Date)
      expect(result.updatedAt.getTime()).toBeGreaterThan(existingBudget.updatedAt.getTime())
    })
  })
})
