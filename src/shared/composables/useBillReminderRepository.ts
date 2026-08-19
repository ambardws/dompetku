import { useSupabaseClient } from '#imports'
import { SupabaseBillReminderRepository } from '~/modules/reminders/infrastructure/SupabaseBillReminderRepository'

export function useBillReminderRepository() {
  const supabase = useSupabaseClient()
  const repository = new SupabaseBillReminderRepository(supabase)
  return { repository }
}
