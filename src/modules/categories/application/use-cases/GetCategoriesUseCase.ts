import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { Category } from '../../domain/entities/Category'

export interface GetCategoriesInput {
  userId: string
  type?: 'income' | 'expense'
}

/**
 * GetCategoriesUseCase
 * Retrieves categories for a user, optionally filtered by type
 */
export class GetCategoriesUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: GetCategoriesInput): Promise<Category[]> {
    // Validation
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    // Get categories by type or all
    if (input.type) {
      return await this.categoryRepository.getByUserIdAndType(input.userId, input.type)
    }

    return await this.categoryRepository.getByUserId(input.userId)
  }
}
