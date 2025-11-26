import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { CreateCategoryInput, Category } from '../../domain/entities/Category'

/**
 * AddCategoryUseCase
 * Creates a new category with validation
 */
export class AddCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<Category> {
    // Validation
    this.validate(input)

    // Normalize input
    const normalizedInput: CreateCategoryInput = {
      ...input,
      name: input.name.trim(),
      isDefault: input.isDefault ?? false,
    }

    // Call repository
    return await this.categoryRepository.add(normalizedInput)
  }

  private validate(input: CreateCategoryInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!input.name || input.name.trim() === '') {
      throw new Error('Category name is required')
    }

    if (!input.icon || input.icon.trim() === '') {
      throw new Error('Category icon is required')
    }

    if (!input.color || input.color.trim() === '') {
      throw new Error('Category color is required')
    }

    // Validate hex color format (#RGB or #RRGGBB)
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
    if (!hexColorRegex.test(input.color)) {
      throw new Error('Invalid color format. Use hex format like #FF5733 or #F00')
    }
  }
}
