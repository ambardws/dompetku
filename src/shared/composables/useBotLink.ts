/**
 * Composable for Telegram Bot Linking
 */
import { ref } from 'vue'

interface LinkTokenResponse {
  success: boolean
  token: string
  expiresAt: string
  message: string
}

interface LinkBotResponse {
  success: boolean
  botUser?: {
    id: string
    platform: string
    platformUsername?: string
  }
  message: string
}

export function useBotLink() {
  const isGeneratingToken = ref(false)
  const linkToken = ref<string | null>(null)
  const tokenExpiresAt = ref<Date | null>(null)
  const error = ref<string | null>(null)

  /**
   * Generate link token for bot account linking
   */
  async function generateLinkToken() {
    isGeneratingToken.value = true
    error.value = null
    linkToken.value = null
    tokenExpiresAt.value = null

    try {
      // Get Supabase client and session
      const supabase = useSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        throw new Error('Not authenticated')
      }

      const response = await $fetch<LinkTokenResponse>('/api/bot/link-token', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`
        }
      })

      if (response.success) {
        linkToken.value = response.token
        tokenExpiresAt.value = new Date(response.expiresAt)
        return {
          success: true,
          token: response.token,
          expiresAt: response.expiresAt
        }
      } else {
        throw new Error('Failed to generate link token')
      }
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Failed to generate link token'
      return {
        success: false,
        error: error.value
      }
    } finally {
      isGeneratingToken.value = false
    }
  }

  /**
   * Reset link token state
   */
  function resetLinkToken() {
    linkToken.value = null
    tokenExpiresAt.value = null
    error.value = null
  }

  /**
   * Copy token to clipboard
   */
  async function copyTokenToClipboard() {
    if (!linkToken.value) return false

    try {
      await navigator.clipboard.writeText(linkToken.value)
      return true
    } catch (err) {
      return false
    }
  }

  /**
   * Get time remaining until token expires
   */
  function getTimeRemaining(): string | null {
    if (!tokenExpiresAt.value) return null

    const now = new Date()
    const diff = tokenExpiresAt.value.getTime() - now.getTime()

    if (diff <= 0) return 'Expired'

    const minutes = Math.floor(diff / 60000)
    const seconds = Math.floor((diff % 60000) / 1000)

    return `${minutes}m ${seconds}s`
  }

  return {
    // State
    isGeneratingToken,
    linkToken,
    tokenExpiresAt,
    error,

    // Methods
    generateLinkToken,
    resetLinkToken,
    copyTokenToClipboard,
    getTimeRemaining
  }
}
