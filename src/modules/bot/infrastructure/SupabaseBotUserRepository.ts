/**
 * Supabase implementation of BotUserRepository
 */
import { nanoid } from 'nanoid'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { BotUserRepository } from '../domain/repositories/BotUserRepository'
import type { BotUser, BotPlatform, BotUserLinkToken } from '../domain/entities/BotUser'

export class SupabaseBotUserRepository implements BotUserRepository {
  constructor(private supabase: SupabaseClient) {}

  async add(botUser: BotUser): Promise<void> {
    const { error } = await this.supabase.from('bot_users').insert({
      id: botUser.id,
      user_id: botUser.userId,
      platform: botUser.platform,
      platform_user_id: botUser.platformUserId,
      platform_username: botUser.platformUsername,
      is_active: botUser.isActive,
      created_at: botUser.createdAt.toISOString(),
      updated_at: botUser.updatedAt.toISOString()
    })

    if (error) {
      throw new Error(`Failed to add bot user: ${error.message}`)
    }
  }

  async findByPlatformUser(
    platform: BotPlatform,
    platformUserId: string
  ): Promise<BotUser | null> {
    const { data, error } = await this.supabase
      .from('bot_users')
      .select('*')
      .eq('platform', platform)
      .eq('platform_user_id', platformUserId)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new Error(`Failed to find bot user: ${error.message}`)
    }

    return this.mapToEntity(data)
  }

  async findByUserId(userId: string): Promise<BotUser[]> {
    const { data, error } = await this.supabase
      .from('bot_users')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to find bot users: ${error.message}`)
    }

    return (data || []).map(this.mapToEntity)
  }

  async update(id: string, updates: Partial<BotUser>): Promise<void> {
    const updateData: Record<string, any> = {}

    if (updates.platformUsername !== undefined) {
      updateData.platform_username = updates.platformUsername
    }
    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive
    }
    if (updates.updatedAt !== undefined) {
      updateData.updated_at = updates.updatedAt.toISOString()
    }

    const { error } = await this.supabase
      .from('bot_users')
      .update(updateData)
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update bot user: ${error.message}`)
    }
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('bot_users')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete bot user: ${error.message}`)
    }
  }

  async createLinkToken(userId: string): Promise<BotUserLinkToken> {
    const token: BotUserLinkToken = {
      token: nanoid(32),
      userId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: new Date()
    }

    const { error } = await this.supabase.from('bot_link_tokens').insert({
      token: token.token,
      user_id: token.userId,
      expires_at: token.expiresAt.toISOString(),
      created_at: token.createdAt.toISOString()
    })

    if (error) {
      throw new Error(`Failed to create link token: ${error.message}`)
    }

    return token
  }

  async verifyLinkToken(token: string): Promise<string | null> {
    const { data, error } = await this.supabase
      .from('bot_link_tokens')
      .select('*')
      .eq('token', token)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows returned
        return null
      }
      throw new Error(`Failed to verify link token: ${error.message}`)
    }

    // Check if token is expired
    const expiresAt = new Date(data.expires_at)
    if (expiresAt < new Date()) {
      // Delete expired token
      await this.supabase.from('bot_link_tokens').delete().eq('token', token)
      return null
    }

    // Delete token after verification (one-time use)
    await this.supabase.from('bot_link_tokens').delete().eq('token', token)

    return data.user_id
  }

  private mapToEntity(data: any): BotUser {
    return {
      id: data.id,
      userId: data.user_id,
      platform: data.platform,
      platformUserId: data.platform_user_id,
      platformUsername: data.platform_username,
      isActive: data.is_active,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    }
  }
}
