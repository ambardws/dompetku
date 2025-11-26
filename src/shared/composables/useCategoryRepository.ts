import { SupabaseCategoryRepository } from '~modules/categories/infrastructure/repositories/SupabaseCategoryRepository'
import type { CategoryRepository } from '~modules/categories/domain/repositories/CategoryRepository'

let repositoryInstance: CategoryRepository | null = null

/**
 * Composable untuk dependency injection CategoryRepository
 * Singleton pattern - reuse same instance
 */
export function useCategoryRepository(): CategoryRepository {
  if (!repositoryInstance) {
    const supabase = useSupabaseClient()
    repositoryInstance = new SupabaseCategoryRepository(supabase)
  }
  return repositoryInstance
}
