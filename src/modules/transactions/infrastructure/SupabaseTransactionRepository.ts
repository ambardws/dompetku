/**
 * Supabase Transaction Repository Implementation
 * Implements data access layer using Supabase client
 */
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TransactionRepository } from '../domain/repositories/TransactionRepository'
import type { Transaction, SearchTransactionsInput } from '../domain/entities/Transaction'

export class SupabaseTransactionRepository implements TransactionRepository {
  constructor(private supabase: SupabaseClient) {}

  async add(transaction: Transaction): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .insert({
        id: transaction.id,
        user_id: transaction.userId,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        category_id: transaction.categoryId,
        note: transaction.note,
        created_at: transaction.createdAt.toISOString()
      })

    if (error) {
      throw new Error(`Failed to add transaction: ${error.message}`)
    }
  }

  async getByPeriod(userId: string, from: Date, to: Date): Promise<Transaction[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', from.toISOString())
      .lte('created_at', to.toISOString())
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to get transactions: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async getById(id: string): Promise<Transaction | null> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null
      }
      throw new Error(`Failed to get transaction: ${error.message}`)
    }

    return data ? this.mapToEntity(data) : null
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('transactions')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete transaction: ${error.message}`)
    }
  }

  async update(id: string, transaction: Partial<Transaction>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (transaction.type !== undefined) updateData.type = transaction.type
    if (transaction.amount !== undefined) updateData.amount = transaction.amount
    if (transaction.category !== undefined) updateData.category = transaction.category
    if (transaction.categoryId !== undefined) updateData.category_id = transaction.categoryId
    if (transaction.note !== undefined) updateData.note = transaction.note

    const { error } = await this.supabase
      .from('transactions')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update transaction: ${error.message}`)
    }
  }

  async search(input: SearchTransactionsInput): Promise<Transaction[]> {
    let query = this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', input.userId)

    // Filter by type (income/expense)
    if (input.type) {
      query = query.eq('type', input.type)
    }

    // Filter by categoryId
    if (input.categoryId) {
      query = query.eq('category_id', input.categoryId)
    }

    // Filter by date range
    if (input.dateFrom) {
      query = query.gte('created_at', input.dateFrom.toISOString())
    }
    if (input.dateTo) {
      query = query.lte('created_at', input.dateTo.toISOString())
    }

    // Filter by amount range
    if (input.amountMin !== undefined) {
      query = query.gte('amount', input.amountMin)
    }
    if (input.amountMax !== undefined) {
      query = query.lte('amount', input.amountMax)
    }

    // Order by created_at descending (newest first)
    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to search transactions: ${error.message}`)
    }

    let results = (data || []).map(this.mapToEntity)

    // Text search in category and note (client-side filtering)
    // Supabase doesn't support case-insensitive LIKE without text search extension
    if (input.query) {
      const searchQuery = input.query.toLowerCase()
      results = results.filter(transaction => {
        const categoryMatch = transaction.category.toLowerCase().includes(searchQuery)
        const noteMatch = transaction.note?.toLowerCase().includes(searchQuery) || false
        return categoryMatch || noteMatch
      })
    }

    return results
  }

  private mapToEntity(row: any): Transaction {
    return {
      id: row.id,
      userId: row.user_id,
      type: row.type,
      amount: row.amount,
      category: row.category || '', // Default to empty string for backward compatibility
      categoryId: row.category_id,
      note: row.note,
      createdAt: new Date(row.created_at)
    }
  }
}
