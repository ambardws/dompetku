/**
 * LinkBotUserUseCase
 * Business logic for linking bot accounts to Dompetku users
 */
import { nanoid } from 'nanoid'
import type { BotUserRepository } from '../../domain/repositories/BotUserRepository'
import type { BotUser, CreateBotUserInput } from '../../domain/entities/BotUser'

export class LinkBotUserUseCase {
  constructor(private repository: BotUserRepository) {}

  async execute(input: CreateBotUserInput): Promise<BotUser> {
    // Validation
    this.validate(input)

    // Check if platform user is already linked
    const existingBotUser = await this.repository.findByPlatformUser(
      input.platform,
      input.platformUserId
    )

    if (existingBotUser) {
      // If linked to different user, throw error
      if (existingBotUser.userId !== input.userId) {
        throw new Error('This bot account is already linked to another user')
      }

      // If linked to same user, update and return
      const updates: Partial<BotUser> = {
        platformUsername: input.platformUsername,
        updatedAt: new Date()
      }
      await this.repository.update(existingBotUser.id, updates)
      return { ...existingBotUser, ...updates }
    }

    // Create new bot user link
    const botUser: BotUser = {
      id: nanoid(),
      userId: input.userId,
      platform: input.platform,
      platformUserId: input.platformUserId,
      platformUsername: input.platformUsername,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    await this.repository.add(botUser)
    return botUser
  }

  private validate(input: CreateBotUserInput): void {
    if (!input.userId || input.userId.trim() === '') {
      throw new Error('User ID is required')
    }

    if (!input.platformUserId || input.platformUserId.trim() === '') {
      throw new Error('Platform user ID is required')
    }

    if (!['telegram', 'whatsapp'].includes(input.platform)) {
      throw new Error('Invalid platform')
    }
  }
}
