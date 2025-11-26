import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../entities/Category'

/**
 * Category Repository Interface
 * Contract untuk category operations
 */
export interface CategoryRepository {
  /**
   * Add new category
   */
  add(input: CreateCategoryInput): Promise<Category>

  /**
   * Get all categories for a user
   */
  getByUserId(userId: string): Promise<Category[]>

  /**
   * Get categories by type (income/expense)
   */
  getByUserIdAndType(userId: string, type: 'income' | 'expense'): Promise<Category[]>

  /**
   * Get category by ID
   */
  getById(id: string): Promise<Category | null>

  /**
   * Update category
   */
  update(id: string, input: UpdateCategoryInput): Promise<Category>

  /**
   * Delete category
   */
  delete(id: string): Promise<void>

  /**
   * Initialize default categories for new user
   */
  initializeDefaultCategories(userId: string): Promise<Category[]>
}
