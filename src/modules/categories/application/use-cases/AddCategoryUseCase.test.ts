import { describe, it, expect, beforeEach, vi } from 'vitest'
import { AddCategoryUseCase } from './AddCategoryUseCase'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { CreateCategoryInput, Category } from '../../domain/entities/Category'

describe('AddCategoryUseCase', () => {
  let useCase: AddCategoryUseCase
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
    useCase = new AddCategoryUseCase(mockRepository)
  })

  describe('Validation', () => {
    it('should reject empty userId', async () => {
      const input: CreateCategoryInput = {
        userId: '',
        name: 'Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
      }

      await expect(useCase.execute(input)).rejects.toThrow('User ID is required')
    })

    it('should reject empty name', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: '',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Category name is required')
    })

    it('should reject empty icon', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '',
        color: '#FF5733',
        type: 'expense',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Category icon is required')
    })

    it('should reject empty color', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '',
        type: 'expense',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Category color is required')
    })

    it('should reject invalid color format', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: 'red',
        type: 'expense',
      }

      await expect(useCase.execute(input)).rejects.toThrow('Invalid color format')
    })
  })

  describe('Successful Category Creation', () => {
    it('should create category with valid input', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        ...input,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.add).mockResolvedValue(mockCategory)

      const result = await useCase.execute(input)

      expect(result.id).toBe('cat-123')
      expect(result.name).toBe('Food')
      expect(result.icon).toBe('🍔')
      expect(result.color).toBe('#FF5733')
      expect(result.type).toBe('expense')
      expect(mockRepository.add).toHaveBeenCalledWith({
        ...input,
        isDefault: false,
      })
    })

    it('should create income category', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Salary',
        icon: '💰',
        color: '#4CAF50',
        type: 'income',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        ...input,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.add).mockResolvedValue(mockCategory)

      const result = await useCase.execute(input)

      expect(result.type).toBe('income')
      expect(mockRepository.add).toHaveBeenCalledWith({
        ...input,
        isDefault: false,
      })
    })

    it('should trim category name', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: '  Food  ',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.add).mockResolvedValue(mockCategory)

      await useCase.execute(input)

      expect(mockRepository.add).toHaveBeenCalledWith({
        ...input,
        name: 'Food',
        isDefault: false,
      })
    })

    it('should accept 3-digit hex color', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '#F00',
        type: 'expense',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        ...input,
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.add).mockResolvedValue(mockCategory)

      const result = await useCase.execute(input)

      expect(result.color).toBe('#F00')
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      const input: CreateCategoryInput = {
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
      }

      vi.mocked(mockRepository.add).mockRejectedValue(
        new Error('Database connection failed')
      )

      await expect(useCase.execute(input)).rejects.toThrow(
        'Database connection failed'
      )
    })
  })
})
