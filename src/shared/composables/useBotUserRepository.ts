/**
 * Composable for BotUserRepository
 */
import { SupabaseBotUserRepository } from '~modules/bot/infrastructure/SupabaseBotUserRepository'
import type { BotUserRepository } from '~modules/bot/domain/repositories/BotUserRepository'

export function useBotUserRepository(): BotUserRepository {
  const supabase = useSupabaseClient()
  return new SupabaseBotUserRepository(supabase)
}
