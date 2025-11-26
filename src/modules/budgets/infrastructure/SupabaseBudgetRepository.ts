/**
 * Supabase Budget Repository Implementation
 * Implements data access layer using Supabase client
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BudgetRepository } from '../domain/repositories/BudgetRepository'
import type { Budget } from '../domain/entities/Budget'

export class SupabaseBudgetRepository implements BudgetRepository {
  constructor(private supabase: SupabaseClient) {}

  async add(budget: Budget): Promise<void> {
    const { error } = await this.supabase
      .from('budgets')
      .insert({
        id: budget.id,
        user_id: budget.userId,
        category_id: budget.categoryId,
        amount: budget.amount,
        period: budget.period,
        created_at: budget.createdAt.toISOString(),
        updated_at: budget.updatedAt.toISOString()
      })

    if (error) {
      throw new Error(`Failed to add budget: ${error.message}`)
    }
  }

  async getByUserId(userId: string): Promise<Budget[]> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get budgets: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async getByCategoryId(userId: string, categoryId: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .eq('category_id', categoryId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get budget: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async getById(id: string): Promise<Budget | null> {
    const { data, error } = await this.supabase
      .from('budgets')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get budget: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async update(id: string, budget: Partial<Budget>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (budget.amount !== undefined) updateData.amount = budget.amount
    if (budget.period !== undefined) updateData.period = budget.period

    const { error } = await this.supabase
      .from('budgets')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update budget: ${error.message}`)
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('budgets')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete budget: ${error.message}`)
    }
  }

  private mapToEntity(row: any): Budget {
    return {
      id: row.id,
      userId: row.user_id,
      categoryId: row.category_id,
      amount: parseFloat(row.amount),
      period: row.period,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at)
    }
  }
}
