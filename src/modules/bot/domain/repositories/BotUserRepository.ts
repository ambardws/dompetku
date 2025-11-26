/**
 * BotUserRepository Interface
 * Contract for bot user data operations
 */

import type { BotUser, CreateBotUserInput, BotPlatform, BotUserLinkToken } from '../entities/BotUser'

export interface BotUserRepository {
  /**
   * Add a new bot user link
   */
  add(botUser: BotUser): Promise<void>

  /**
   * Find bot user by platform and platform user ID
   */
  findByPlatformUser(platform: BotPlatform, platformUserId: string): Promise<BotUser | null>

  /**
   * Find bot user by Dompetku user ID
   */
  findByUserId(userId: string): Promise<BotUser[]>

  /**
   * Update bot user
   */
  update(id: string, updates: Partial<BotUser>): Promise<void>

  /**
   * Delete bot user link
   */
  delete(id: string): Promise<void>

  /**
   * Create a link token for user verification
   */
  createLinkToken(userId: string): Promise<BotUserLinkToken>

  /**
   * Verify and consume a link token
   */
  verifyLinkToken(token: string): Promise<string | null> // Returns userId if valid
}
