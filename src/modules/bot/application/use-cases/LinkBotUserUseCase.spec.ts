/**
 * LinkBotUserUseCase Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { LinkBotUserUseCase } from './LinkBotUserUseCase'
import type { BotUserRepository } from '../../domain/repositories/BotUserRepository'
import type { BotUser, BotUserLinkToken } from '../../domain/entities/BotUser'

// Mock repository
class MockBotUserRepository implements BotUserRepository {
  private botUsers: BotUser[] = []
  private linkTokens: BotUserLinkToken[] = []

  async add(botUser: BotUser): Promise<void> {
    this.botUsers.push(botUser)
  }

  async findByPlatformUser(platform: string, platformUserId: string): Promise<BotUser | null> {
    return this.botUsers.find(u => u.platform === platform && u.platformUserId === platformUserId) || null
  }

  async findByUserId(userId: string): Promise<BotUser[]> {
    return this.botUsers.filter(u => u.userId === userId)
  }

  async update(id: string, updates: Partial<BotUser>): Promise<void> {
    const index = this.botUsers.findIndex(u => u.id === id)
    if (index !== -1) {
      this.botUsers[index] = { ...this.botUsers[index], ...updates }
    }
  }

  async delete(id: string): Promise<void> {
    this.botUsers = this.botUsers.filter(u => u.id !== id)
  }

  async createLinkToken(userId: string): Promise<BotUserLinkToken> {
    const token: BotUserLinkToken = {
      token: `token-${userId}-${Date.now()}`,
      userId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      createdAt: new Date()
    }
    this.linkTokens.push(token)
    return token
  }

  async verifyLinkToken(token: string): Promise<string | null> {
    const linkToken = this.linkTokens.find(t => t.token === token)
    if (!linkToken) return null
    if (linkToken.expiresAt < new Date()) return null
    // Remove token after verification
    this.linkTokens = this.linkTokens.filter(t => t.token !== token)
    return linkToken.userId
  }

  // Helper for tests
  getAll(): BotUser[] {
    return this.botUsers
  }
}

describe('LinkBotUserUseCase', () => {
  let useCase: LinkBotUserUseCase
  let repository: MockBotUserRepository

  beforeEach(() => {
    repository = new MockBotUserRepository()
    useCase = new LinkBotUserUseCase(repository)
  })

  describe('Validation', () => {
    it('should throw error if userId is empty', async () => {
      await expect(useCase.execute({
        userId: '',
        platform: 'telegram',
        platformUserId: '123456'
      })).rejects.toThrow('User ID is required')
    })

    it('should throw error if platformUserId is empty', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: ''
      })).rejects.toThrow('Platform user ID is required')
    })

    it('should throw error if platform is invalid', async () => {
      await expect(useCase.execute({
        userId: 'user-1',
        platform: 'invalid' as any,
        platformUserId: '123456'
      })).rejects.toThrow('Invalid platform')
    })
  })

  describe('Link Creation', () => {
    it('should create a new bot user link', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456',
        platformUsername: '@testuser'
      })

      expect(result).toBeDefined()
      expect(result.userId).toBe('user-1')
      expect(result.platform).toBe('telegram')
      expect(result.platformUserId).toBe('123456')
      expect(result.platformUsername).toBe('@testuser')
      expect(result.isActive).toBe(true)
      expect(result.id).toBeDefined()
      expect(result.createdAt).toBeInstanceOf(Date)
      expect(result.updatedAt).toBeInstanceOf(Date)
    })

    it('should create link without username', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456'
      })

      expect(result.platformUsername).toBeUndefined()
    })

    it('should create link for WhatsApp platform', async () => {
      const result = await useCase.execute({
        userId: 'user-1',
        platform: 'whatsapp',
        platformUserId: '+6281234567890'
      })

      expect(result.platform).toBe('whatsapp')
      expect(result.platformUserId).toBe('+6281234567890')
    })
  })

  describe('Duplicate Prevention', () => {
    it('should throw error if platform user is already linked to different user', async () => {
      // First link
      await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456'
      })

      // Try to link same platform user to different user
      await expect(useCase.execute({
        userId: 'user-2',
        platform: 'telegram',
        platformUserId: '123456'
      })).rejects.toThrow('This bot account is already linked to another user')
    })

    it('should allow re-linking same user to same platform user', async () => {
      // First link
      const first = await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456'
      })

      // Re-link same combination (should update)
      const second = await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456',
        platformUsername: '@newusername'
      })

      expect(second.id).toBe(first.id)
      expect(second.platformUsername).toBe('@newusername')
    })

    it('should allow same user to link multiple platforms', async () => {
      const telegram = await useCase.execute({
        userId: 'user-1',
        platform: 'telegram',
        platformUserId: '123456'
      })

      const whatsapp = await useCase.execute({
        userId: 'user-1',
        platform: 'whatsapp',
        platformUserId: '+6281234567890'
      })

      expect(telegram.id).not.toBe(whatsapp.id)
      expect(repository.getAll()).toHaveLength(2)
    })
  })
})
