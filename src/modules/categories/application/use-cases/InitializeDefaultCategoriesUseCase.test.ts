import { describe, it, expect, beforeEach, vi } from 'vitest'
import { InitializeDefaultCategoriesUseCase } from './InitializeDefaultCategoriesUseCase'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { Category } from '../../domain/entities/Category'

describe('InitializeDefaultCategoriesUseCase', () => {
  let useCase: InitializeDefaultCategoriesUseCase
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
    useCase = new InitializeDefaultCategoriesUseCase(mockRepository)
  })

  describe('Initialize Default Categories', () => {
    it('should initialize default categories for new user', async () => {
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
          name: 'Transportation',
          icon: '🚗',
          color: '#2196F3',
          type: 'expense',
          isDefault: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]

      vi.mocked(mockRepository.initializeDefaultCategories).mockResolvedValue(
        mockCategories
      )

      const result = await useCase.execute('user-123')

      expect(result).toHaveLength(2)
      expect(result[0].isDefault).toBe(true)
      expect(mockRepository.initializeDefaultCategories).toHaveBeenCalledWith('user-123')
    })

    it('should reject empty userId', async () => {
      await expect(useCase.execute('')).rejects.toThrow('User ID is required')
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.initializeDefaultCategories).mockRejectedValue(
        new Error('Database error')
      )

      await expect(useCase.execute('user-123')).rejects.toThrow('Database error')
    })
  })
})
