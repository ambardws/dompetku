/**
 * Link Bot User with Token
 * POST /api/bot/link
 */
export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { token, platform, platformUserId, platformUsername } = body

    if (!token || !platform || !platformUserId) {
      return {
        success: false,
        message: 'Missing required fields'
      }
    }

    // Get runtime config
    const config = useRuntimeConfig()
    const supabaseUrl = config.public.supabaseUrl
    const supabaseKey = config.public.supabaseKey

    // Find and validate token (use service role key for admin access)
    const tokenResponse = await fetch(
      `${supabaseUrl}/rest/v1/bot_link_tokens?token=eq.${token}&select=*`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )

    const tokens = await tokenResponse.json()
    if (!tokens || tokens.length === 0) {
      return {
        success: false,
        message: 'Invalid or expired token'
      }
    }

    const linkTokenData = tokens[0]

    // Check if token is expired
    const expiresAt = new Date(linkTokenData.expires_at)
    if (expiresAt < new Date()) {
      return {
        success: false,
        message: 'Token has expired'
      }
    }

    // Check if platform user already linked
    const existingBotResponse = await fetch(
      `${supabaseUrl}/rest/v1/bot_users?platform=eq.${platform}&platform_user_id=eq.${platformUserId}&select=id`,
      {
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`
        }
      }
    )

    const existingBots = await existingBotResponse.json()
    if (existingBots && existingBots.length > 0) {
      return {
        success: false,
        message: 'Bot user already linked to an account'
      }
    }

    // Generate unique ID for bot user
    const botUserId = `bot_${platform}_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

    // Create bot user
    const createBotResponse = await fetch(`${supabaseUrl}/rest/v1/bot_users`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation'
      },
      body: JSON.stringify({
        id: botUserId,
        user_id: linkTokenData.user_id,
        platform,
        platform_user_id: platformUserId,
        platform_username: platformUsername || null
      })
    })

    if (!createBotResponse.ok) {
      const errorText = await createBotResponse.text()
      console.error('Bot user creation error:', errorText)
      return {
        success: false,
        message: 'Failed to link bot user'
      }
    }

    const botUsers = await createBotResponse.json()
    const botUser = botUsers[0]

    // Delete used token
    await fetch(`${supabaseUrl}/rest/v1/bot_link_tokens?id=eq.${linkTokenData.id}`, {
      method: 'DELETE',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    })

    return {
      success: true,
      botUser: {
        id: botUser.id,
        platform: botUser.platform,
        platformUsername: botUser.platform_username
      },
      message: 'Bot linked successfully'
    }
  } catch (error: any) {
    console.error('Link bot error:', error)
    return {
      success: false,
      message: error.message || 'Failed to link bot'
    }
  }
})
