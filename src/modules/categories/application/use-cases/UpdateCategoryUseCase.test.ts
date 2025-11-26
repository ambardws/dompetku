import { describe, it, expect, beforeEach, vi } from 'vitest'
import { UpdateCategoryUseCase } from './UpdateCategoryUseCase'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { UpdateCategoryInput, Category } from '../../domain/entities/Category'

describe('UpdateCategoryUseCase', () => {
  let useCase: UpdateCategoryUseCase
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
    useCase = new UpdateCategoryUseCase(mockRepository)
  })

  describe('Validation', () => {
    it('should reject empty id', async () => {
      const input: UpdateCategoryInput = {
        name: 'Updated Food',
      }

      await expect(useCase.execute('', input)).rejects.toThrow('Category ID is required')
    })

    it('should reject empty update input', async () => {
      await expect(useCase.execute('cat-123', {})).rejects.toThrow(
        'At least one field must be provided for update'
      )
    })

    it('should reject invalid color format', async () => {
      const input: UpdateCategoryInput = {
        color: 'red',
      }

      await expect(useCase.execute('cat-123', input)).rejects.toThrow(
        'Invalid color format'
      )
    })

    it('should reject empty name', async () => {
      const input: UpdateCategoryInput = {
        name: '   ',
      }

      await expect(useCase.execute('cat-123', input)).rejects.toThrow(
        'Category name cannot be empty'
      )
    })

    it('should reject empty icon', async () => {
      const input: UpdateCategoryInput = {
        icon: '   ',
      }

      await expect(useCase.execute('cat-123', input)).rejects.toThrow(
        'Category icon cannot be empty'
      )
    })
  })

  describe('Successful Update', () => {
    it('should update category name', async () => {
      const input: UpdateCategoryInput = {
        name: 'Updated Food',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Updated Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.update).mockResolvedValue(mockCategory)

      const result = await useCase.execute('cat-123', input)

      expect(result.name).toBe('Updated Food')
      expect(mockRepository.update).toHaveBeenCalledWith('cat-123', {
        name: 'Updated Food',
      })
    })

    it('should update category icon', async () => {
      const input: UpdateCategoryInput = {
        icon: '🍕',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Food',
        icon: '🍕',
        color: '#FF5733',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.update).mockResolvedValue(mockCategory)

      const result = await useCase.execute('cat-123', input)

      expect(result.icon).toBe('🍕')
      expect(mockRepository.update).toHaveBeenCalledWith('cat-123', {
        icon: '🍕',
      })
    })

    it('should update category color', async () => {
      const input: UpdateCategoryInput = {
        color: '#00FF00',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Food',
        icon: '🍔',
        color: '#00FF00',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.update).mockResolvedValue(mockCategory)

      const result = await useCase.execute('cat-123', input)

      expect(result.color).toBe('#00FF00')
      expect(mockRepository.update).toHaveBeenCalledWith('cat-123', {
        color: '#00FF00',
      })
    })

    it('should update multiple fields at once', async () => {
      const input: UpdateCategoryInput = {
        name: 'Pizza',
        icon: '🍕',
        color: '#FF6B35',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Pizza',
        icon: '🍕',
        color: '#FF6B35',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.update).mockResolvedValue(mockCategory)

      const result = await useCase.execute('cat-123', input)

      expect(result.name).toBe('Pizza')
      expect(result.icon).toBe('🍕')
      expect(result.color).toBe('#FF6B35')
      expect(mockRepository.update).toHaveBeenCalledWith('cat-123', input)
    })

    it('should trim name before updating', async () => {
      const input: UpdateCategoryInput = {
        name: '  Updated Food  ',
      }

      const mockCategory: Category = {
        id: 'cat-123',
        userId: 'user-123',
        name: 'Updated Food',
        icon: '🍔',
        color: '#FF5733',
        type: 'expense',
        isDefault: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      vi.mocked(mockRepository.update).mockResolvedValue(mockCategory)

      await useCase.execute('cat-123', input)

      expect(mockRepository.update).toHaveBeenCalledWith('cat-123', {
        name: 'Updated Food',
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      const input: UpdateCategoryInput = {
        name: 'Updated Food',
      }

      vi.mocked(mockRepository.update).mockRejectedValue(
        new Error('Database error')
      )

      await expect(useCase.execute('cat-123', input)).rejects.toThrow(
        'Database error'
      )
    })
  })
})
