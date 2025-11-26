/**
 * Budget Repository Composable
 * Provides dependency injection for budget repository
 */
import { SupabaseBudgetRepository } from '~modules/budgets/infrastructure/SupabaseBudgetRepository'
import type { BudgetRepository } from '~modules/budgets/domain/repositories/BudgetRepository'

export function useBudgetRepository(): BudgetRepository {
  const supabase = useSupabaseClient()
  return new SupabaseBudgetRepository(supabase)
}
