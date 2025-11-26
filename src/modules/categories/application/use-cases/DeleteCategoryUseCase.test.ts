import { describe, it, expect, beforeEach, vi } from 'vitest'
import { DeleteCategoryUseCase } from './DeleteCategoryUseCase'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'

describe('DeleteCategoryUseCase', () => {
  let useCase: DeleteCategoryUseCase
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
    useCase = new DeleteCategoryUseCase(mockRepository)
  })

  describe('Validation', () => {
    it('should reject empty id', async () => {
      await expect(useCase.execute('')).rejects.toThrow('Category ID is required')
    })
  })

  describe('Successful Deletion', () => {
    it('should delete category', async () => {
      vi.mocked(mockRepository.delete).mockResolvedValue()

      await expect(useCase.execute('cat-123')).resolves.toBeUndefined()
      expect(mockRepository.delete).toHaveBeenCalledWith('cat-123')
    })
  })

  describe('Error Handling', () => {
    it('should handle repository errors', async () => {
      vi.mocked(mockRepository.delete).mockRejectedValue(
        new Error('Cannot delete default category')
      )

      await expect(useCase.execute('cat-123')).rejects.toThrow(
        'Cannot delete default category'
      )
    })
  })
})
