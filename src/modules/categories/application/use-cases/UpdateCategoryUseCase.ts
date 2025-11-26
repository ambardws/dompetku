import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { UpdateCategoryInput, Category } from '../../domain/entities/Category'

/**
 * UpdateCategoryUseCase
 * Updates an existing category with validation
 */
export class UpdateCategoryUseCase {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, input: UpdateCategoryInput): Promise<Category> {
    // Validation
    this.validate(id, input)

    // Normalize input
    const normalizedInput: UpdateCategoryInput = {}

    if (input.name !== undefined) {
      normalizedInput.name = input.name.trim()
    }

    if (input.icon !== undefined) {
      normalizedInput.icon = input.icon
    }

    if (input.color !== undefined) {
      normalizedInput.color = input.color
    }

    // Call repository
    return await this.categoryRepository.update(id, normalizedInput)
  }

  private validate(id: string, input: UpdateCategoryInput): void {
    if (!id || id.trim() === '') {
      throw new Error('Category ID is required')
    }

    // Check if at least one field is provided
    const hasName = input.name !== undefined
    const hasIcon = input.icon !== undefined
    const hasColor = input.color !== undefined

    if (!hasName && !hasIcon && !hasColor) {
      throw new Error('At least one field must be provided for update')
    }

    // Validate name if provided
    if (hasName && (!input.name || input.name.trim() === '')) {
      throw new Error('Category name cannot be empty')
    }

    // Validate icon if provided
    if (hasIcon && (!input.icon || input.icon.trim() === '')) {
      throw new Error('Category icon cannot be empty')
    }

    // Validate color if provided
    if (hasColor) {
      const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/
      if (!hexColorRegex.test(input.color!)) {
        throw new Error('Invalid color format. Use hex format like #FF5733 or #F00')
      }
    }
  }
}
