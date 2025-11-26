import { SupabaseAuthRepository } from '~modules/auth/infrastructure/repositories/SupabaseAuthRepository'
import type { AuthRepository } from '~modules/auth/domain/repositories/AuthRepository'

let repositoryInstance: AuthRepository | null = null

/**
 * Composable untuk dependency injection AuthRepository
 * Singleton pattern - reuse same instance
 */
export function useAuthRepository(): AuthRepository {
  if (!repositoryInstance) {
    const supabase = useSupabaseClient()
    repositoryInstance = new SupabaseAuthRepository(supabase)
  }
  return repositoryInstance
}
