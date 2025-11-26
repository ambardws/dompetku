/**
 * Transaction Repository Composable
 * Provides dependency injection for transaction repository
 */
import { useSupabaseClient } from '#imports'
import { SupabaseTransactionRepository } from '~modules/transactions/infrastructure'
import type { TransactionRepository } from '~modules/transactions/domain/repositories/TransactionRepository'

let repository: TransactionRepository | null = null

export const useTransactionRepository = (): TransactionRepository => {
  if (!repository) {
    const supabase = useSupabaseClient()
    repository = new SupabaseTransactionRepository(supabase)
  }
  return repository
}
