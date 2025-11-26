import type { SupabaseClient } from '@supabase/supabase-js'
import type { CategoryRepository } from '../../domain/repositories/CategoryRepository'
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '../../domain/entities/Category'

/**
 * Default categories template
 */
const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: '🍔', color: '#FF5733' },
  { name: 'Transportation', icon: '🚗', color: '#2196F3' },
  { name: 'Shopping', icon: '🛍️', color: '#E91E63' },
  { name: 'Entertainment', icon: '🎬', color: '#9C27B0' },
  { name: 'Healthcare', icon: '⚕️', color: '#00BCD4' },
  { name: 'Bills & Utilities', icon: '📝', color: '#FF9800' },
  { name: 'Education', icon: '📚', color: '#3F51B5' },
  { name: 'Others', icon: '📦', color: '#607D8B' },
]

const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: '💰', color: '#4CAF50' },
  { name: 'Freelance', icon: '💻', color: '#8BC34A' },
  { name: 'Investment', icon: '📈', color: '#009688' },
  { name: 'Gift', icon: '🎁', color: '#CDDC39' },
  { name: 'Others', icon: '📦', color: '#607D8B' },
]

/**
 * Supabase Category Repository Implementation
 */
export class SupabaseCategoryRepository implements CategoryRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async add(input: CreateCategoryInput): Promise<Category> {
    const { data, error } = await this.supabase
      .from('categories')
      .insert({
        user_id: input.userId,
        name: input.name,
        icon: input.icon,
        color: input.color,
        type: input.type,
        is_default: input.isDefault ?? false,
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to add category: ${error.message}`)
    }

    return this.mapToCategory(data)
  }

  async getByUserId(userId: string): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .order('type', { ascending: true })
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to get categories: ${error.message}`)
    }

    return data.map((item) => this.mapToCategory(item))
  }

  async getByUserIdAndType(userId: string, type: 'income' | 'expense'): Promise<Category[]> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('user_id', userId)
      .eq('type', type)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to get categories by type: ${error.message}`)
    }

    return data.map((item) => this.mapToCategory(item))
  }

  async getById(id: string): Promise<Category | null> {
    const { data, error } = await this.supabase
      .from('categories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return null
      }
      throw new Error(`Failed to get category: ${error.message}`)
    }

    return this.mapToCategory(data)
  }

  async update(id: string, input: UpdateCategoryInput): Promise<Category> {
    const updateData: any = {}
    if (input.name !== undefined) updateData.name = input.name
    if (input.icon !== undefined) updateData.icon = input.icon
    if (input.color !== undefined) updateData.color = input.color

    const { data, error } = await this.supabase
      .from('categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update category: ${error.message}`)
    }

    return this.mapToCategory(data)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('categories').delete().eq('id', id)

    if (error) {
      throw new Error(`Failed to delete category: ${error.message}`)
    }
  }

  async initializeDefaultCategories(userId: string): Promise<Category[]> {
    const categories: CreateCategoryInput[] = []

    // Add expense categories
    for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
      categories.push({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: 'expense',
        isDefault: true,
      })
    }

    // Add income categories
    for (const cat of DEFAULT_INCOME_CATEGORIES) {
      categories.push({
        userId,
        name: cat.name,
        icon: cat.icon,
        color: cat.color,
        type: 'income',
        isDefault: true,
      })
    }

    // Batch insert
    const { data, error } = await this.supabase
      .from('categories')
      .insert(
        categories.map((cat) => ({
          user_id: cat.userId,
          name: cat.name,
          icon: cat.icon,
          color: cat.color,
          type: cat.type,
          is_default: cat.isDefault,
        }))
      )
      .select()

    if (error) {
      throw new Error(`Failed to initialize default categories: ${error.message}`)
    }

    return data.map((item) => this.mapToCategory(item))
  }

  /**
   * Helper: Map database row to Category entity
   */
  private mapToCategory(data: any): Category {
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      icon: data.icon,
      color: data.color,
      type: data.type,
      isDefault: data.is_default,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at),
    }
  }
}
