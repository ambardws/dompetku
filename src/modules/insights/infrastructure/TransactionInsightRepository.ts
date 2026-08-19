import type { SupabaseClient } from '@supabase/supabase-js'
import type { InsightRepository } from '../domain/repositories/InsightRepository'

export class TransactionInsightRepository implements InsightRepository {
  constructor(private supabase: SupabaseClient) {}

  async getTransactionsByPeriod(userId: string, from: Date, to: Date): Promise<any[]> {
    const { data, error } = await this.supabase
      .from('transactions')
      .select('*')
      .eq('user_id', userId)
      .gte('transaction_date', from.toISOString())
      .lte('transaction_date', to.toISOString())

    if (error) throw new Error(`Failed to get transactions: ${error.message}`)
    return data || []
  }
}
