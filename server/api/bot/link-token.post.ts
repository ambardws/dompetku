/**
 * Generate Link Token for Bot Account Linking
 * POST /api/bot/link-token
 *
 * Uses Supabase REST API directly (no SDK) to avoid Windows ESM issues
 */
export default defineEventHandler(async (event) => {
  try {
    // Get runtime config
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseKey = config.public.supabaseKey

    // Get authorization header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader) {
      return {
        success: false,
        message: 'Unauthorized - No auth header'
      }
    }

    const token = authHeader.replace('Bearer ', '')

    // Get user from Supabase auth
    const userResponse = await fetch(`${supabaseUrl}/auth/v1/user`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey
      }
    })

    if (!userResponse.ok) {
      return {
        success: false,
        message: 'Unauthorized - Invalid token'
      }
    }

    const userData = await userResponse.json()
    const userId = userData.id

    // Generate random token
    const linkToken = Array.from({ length: 32 }, () =>
      'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        .charAt(Math.floor(Math.random() * 62))
    ).join('')

    // Set expiration to 5 minutes
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    // Insert to database using REST API
    const insertResponse = await fetch(`${supabaseUrl}/rest/v1/bot_link_tokens`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        user_id: userId,
        token: linkToken,
        expires_at: expiresAt.toISOString()
      })
    })

    if (!insertResponse.ok) {
      const errorText = await insertResponse.text()
      console.error('Insert error:', errorText)
      return {
        success: false,
        message: 'Failed to create link token'
      }
    }

    return {
      success: true,
      token: linkToken,
      expiresAt: expiresAt.toISOString(),
      message: 'Link token generated successfully'
    }
  } catch (error: any) {
    console.error('Link token error:', error)
    return {
      success: false,
      message: error.message || 'Failed to generate link token'
    }
  }
})
