import { useSupabaseClient } from '#imports'
import { SupabaseRecurringTransactionRepository } from '~modules/recurring/infrastructure/SupabaseRecurringTransactionRepository'

export function useRecurringTransactionRepository() {
  const supabase = useSupabaseClient()
  const repository = new SupabaseRecurringTransactionRepository(supabase)
  return { repository }
}
