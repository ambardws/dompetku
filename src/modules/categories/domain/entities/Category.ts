/**
 * Category Entity
 * Represents a transaction category (e.g., Food, Transportation, Shopping)
 */
export interface Category {
  id: string
  userId: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  isDefault: boolean // System default categories vs user custom
  createdAt: Date
  updatedAt: Date
}

/**
 * Create Category Input
 */
export interface CreateCategoryInput {
  userId: string
  name: string
  icon: string
  color: string
  type: 'income' | 'expense'
  isDefault?: boolean
}

/**
 * Update Category Input
 */
export interface UpdateCategoryInput {
  name?: string
  icon?: string
  color?: string
}
