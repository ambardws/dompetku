import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GetCategoriesUseCase } from './GetCategoriesUseCase'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { Category } from '../../domain/entities/Category'

describe('GetCategoriesUseCase', () => {
  let useCase: GetCategoriesUseCase
  let mockRepository: CategoryRepository

  beforeEach(() => {
    mockRepository = {
      add: vi.fn(),
      getByUserId: vi.fn(),
      getByUserIdAndType: vi.fn(),
      getById: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
      initializeDefaultCategories: vi.fn(),
    }
    useCase = new GetCategoriesUseCase(mockRepository)
  })

  describe('Get All Categories', () => {
    it('should return all categories for user', async () => {
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
          name: 'Salary',
          icon: '💰',
          color: '#4CAF50',
          type: 'income',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockRepository.getByUserId).mockResolvedValue(mockCategories)

      const result = await useCase.execute({ userId: 'user-123' })

      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('Food')
      expect(result[1].name).toBe('Salary')
      expect(mockRepository.getByUserId).toHaveBeenCalledWith('user-123')
    })

    it('should return empty array when no categories', async () => {
      vi.mocked(mockRepository.getByUserId).mockResolvedValue([])

      const result = await useCase.execute({ userId: 'user-123' })

      expect(result).toHaveLength(0)
    })
  })

  describe('Get Categories by Type', () => {
    it('should return only expense categories', async () => {
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
      ]

      vi.mocked(mockRepository.getByUserIdAndType).mockResolvedValue(mockCategories)

      const result = await useCase.execute({ userId: 'user-123', type: 'expense' })

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('expense')
      expect(mockRepository.getByUserIdAndType).toHaveBeenCalledWith('user-123', 'expense')
    })

    it('should return only income categories', async () => {
      const mockCategories: Category[] = [
        {
          id: 'cat-2',
          userId: 'user-123',
          name: 'Salary',
          icon: '💰',
          color: '#4CAF50',
          type: 'income',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockRepository.getByUserIdAndType).mockResolvedValue(mockCategories)

      const result = await useCase.execute({ userId: 'user-123', type: 'income' })

      expect(result).toHaveLength(1)
      expect(result[0].type).toBe('income')
      expect(mockRepository.getByUserIdAndType).toHaveBeenCalledWith('user-123', 'income')
    })
  })

  describe('Validation', () => {
    it('should reject empty userId', async () => {
      await expect(useCase.execute({ userId: '' })).rejects.toThrow(
        'User ID is required'
      )
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.getByUserId).mockRejectedValue(
        new Error('Database error')
      )

      await expect(useCase.execute({ userId: 'user-123' })).rejects.toThrow(
        'Database error'
      )
    })
  })
})
