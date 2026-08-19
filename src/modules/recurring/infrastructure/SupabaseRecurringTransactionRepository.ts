import type { SupabaseClient } from '@supabase/supabase-js'
import type { RecurringTransactionRepository } from '../../domain/repositories/RecurringTransactionRepository'
import type { RecurringTransaction } from '../../domain/entities/RecurringTransaction'

export class SupabaseRecurringTransactionRepository implements RecurringTransactionRepository {
  constructor(private supabase: SupabaseClient) {}

  async add(transaction: RecurringTransaction): Promise<void> {
    const insertData: Record<string, any> = {
      user_id: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      category: transaction.category,
      category_id: transaction.categoryId,
      note: transaction.note,
      frequency: transaction.frequency,
      start_date: transaction.startDate.toISOString(),
      next_date: transaction.nextDate.toISOString(),
      is_active: transaction.isActive,
      created_at: transaction.createdAt.toISOString(),
      updated_at: transaction.updatedAt.toISOString()
    }

    // Only include id if it's a valid UUID (not empty string)
    if (transaction.id && transaction.id.trim() !== '') {
      insertData.id = transaction.id
    }

    const { error } = await this.supabase.from('recurring_transactions').insert(insertData)
    if (error) throw new Error(`Failed to add recurring transaction: ${error.message}`)
  }

  async getByUserId(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await this.supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('next_date', { ascending: true })
    if (error) throw new Error(`Failed to get recurring transactions: ${error.message}`)
    return (data || []).map(this.mapToEntity)
  }

  async getActiveByUserId(userId: string): Promise<RecurringTransaction[]> {
    const { data, error } = await this.supabase
      .from('recurring_transactions')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('next_date', { ascending: true })
    if (error) throw new Error(`Failed to get active recurring transactions: ${error.message}`)
    return (data || []).map(this.mapToEntity)
  }

  async getById(id: string): Promise<RecurringTransaction | null> {
    const { data, error } = await this.supabase
      .from('recurring_transactions')
      .select('*')
      .eq('id', id)
      .single()
    if (error) {
      if (error.code === 'PGRST116') return null
      throw new Error(`Failed to get recurring transaction: ${error.message}`)
    }
    return this.mapToEntity(data)
  }

  async update(id: string, updates: Partial<RecurringTransaction>): Promise<void> {
    const updateData: Record<string, any> = {}
    if (updates.amount !== undefined) updateData.amount = updates.amount
    if (updates.category !== undefined) updateData.category = updates.category
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId
    if (updates.note !== undefined) updateData.note = updates.note
    if (updates.frequency !== undefined) updateData.frequency = updates.frequency
    if (updates.nextDate !== undefined) updateData.next_date = updates.nextDate.toISOString()
    if (updates.isActive !== undefined) updateData.is_active = updates.isActive
    if (updates.updatedAt !== undefined) updateData.updated_at = updates.updatedAt.toISOString()

    const { error } = await this.supabase
      .from('recurring_transactions')
      .update(updateData)
      .eq('id', id)
    if (error) throw new Error(`Failed to update recurring transaction: ${error.message}`)
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from('recurring_transactions').delete().eq('id', id)
    if (error) throw new Error(`Failed to delete recurring transaction: ${error.message}`)
  }

  private mapToEntity(data: any): RecurringTransaction {
    return {
      id: data.id,
      userId: data.user_id,
      type: data.type,
      amount: parseFloat(data.amount),
      category: data.category,
      categoryId: data.category_id,
      note: data.note,
      frequency: data.frequency,
      startDate: new Date(data.start_date),
      nextDate: new Date(data.next_date),
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}
