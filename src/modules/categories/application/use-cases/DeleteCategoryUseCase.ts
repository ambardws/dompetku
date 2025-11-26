import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'

/**
 * DeleteCategoryUseCase
 * Deletes a category (only non-default categories can be deleted due to RLS)
 */
export class DeleteCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string): Promise<void> {
    // Validation
    if (!id || id.trim() === '') {
      throw new Error('Category ID is required')
    }

    // Call repository
    await this.categoryRepository.delete(id)
  }
}
