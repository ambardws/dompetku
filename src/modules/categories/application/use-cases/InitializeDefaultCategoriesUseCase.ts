import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { Category } from '../../domain/entities/Category'

/**
 * InitializeDefaultCategoriesUseCase
 * Creates default categories for a new user
 */
export class InitializeDefaultCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(userId: string): Promise<Category[]> {
    // Validation
    if (!userId || userId.trim() === '') {
      throw new Error('User ID is required')
    }

    // Initialize default categories
    return await this.categoryRepository.initializeDefaultCategories(userId)
  }
}
