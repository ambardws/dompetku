import { useSupabaseClient } from '#imports'
import { TransactionInsightRepository } from '~modules/insights/infrastructure/TransactionInsightRepository'

export function useInsightRepository() {
  const supabase = useSupabaseClient()
  const repository = new TransactionInsightRepository(supabase)
  return { repository }
}
