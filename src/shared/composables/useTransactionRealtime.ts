/**
 * Transaction Realtime Composable
 * Handles real-time subscriptions for transaction changes
 */
import { ref, onUnmounted } from 'vue'
import { useSupabaseClient } from '#imports'
import type { RealtimeChannel } from '@supabase/supabase-js'

export interface TransactionRealtimePayload {
  id: string
  user_id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  category_id?: string
  note?: string
  created_at: string
}

export const useTransactionRealtime = () => {
  const supabase = useSupabaseClient()
  const channel = ref<RealtimeChannel | null>(null)

  /**
   * Subscribe to transaction changes for a specific user
   */
  const subscribe = (
    userId: string,
    callbacks: {
      onInsert?: (payload: TransactionRealtimePayload) => void
      onUpdate?: (payload: TransactionRealtimePayload) => void
      onDelete?: (payload: { id: string }) => void
    }
  ) => {
    // Unsubscribe if already subscribed
    unsubscribe()

    // Create channel for this user's transactions
    channel.value = supabase
      .channel(`transactions:user_id=eq.${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onInsert) {
            callbacks.onInsert(payload.new as TransactionRealtimePayload)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onUpdate) {
            callbacks.onUpdate(payload.new as TransactionRealtimePayload)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          if (callbacks.onDelete) {
            callbacks.onDelete({ id: payload.old.id })
          }
        }
      )
      .subscribe()
  }

  /**
   * Unsubscribe from transaction changes
   */
  const unsubscribe = () => {
    if (channel.value) {
      supabase.removeChannel(channel.value)
      channel.value = null
    }
  }

  // Auto cleanup on component unmount
  onUnmounted(() => {
    unsubscribe()
  })

  return {
    subscribe,
    unsubscribe
  }
}
