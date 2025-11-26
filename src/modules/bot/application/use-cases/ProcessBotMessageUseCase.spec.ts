/**
 * ProcessBotMessageUseCase Tests
 */
import { describe, it, expect, beforeEach } from 'vitest'
import { ProcessBotMessageUseCase } from './ProcessBotMessageUseCase'
import { ParseBotCommandUseCase } from '../../../transactions/application/use-cases/ParseBotCommandUseCase'
import { AddTransactionUseCase } from '../../../transactions/application/use-cases/AddTransactionUseCase'
import type { BotUserRepository } from '../../domain/repositories/BotUserRepository'
import type { TransactionRepository } from '../../../transactions/domain/repositories/TransactionRepository'
import type { BotUser } from '../../domain/entities/BotUser'
import type { BotMessage } from '../../domain/entities/BotMessage'
import type { Transaction } from '../../../transactions/domain/entities/Transaction'

// Mock BotUserRepository
class MockBotUserRepository implements BotUserRepository {
  private botUsers: BotUser[] = []

  async add(botUser: BotUser): Promise<void> {
    this.botUsers.push(botUser)
  }

  async findByPlatformUser(platform: string, platformUserId: string): Promise<BotUser | null> {
    return this.botUsers.find(u => u.platform === platform && u.platformUserId === platformUserId) || null
  }

  async findByUserId(userId: string): Promise<BotUser[]> {
    return this.botUsers.filter(u => u.userId === userId)
  }

  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async createLinkToken(): Promise<any> { return null }
  async verifyLinkToken(): Promise<string | null> { return null }

  // Helper for tests
  addBotUser(botUser: BotUser): void {
    this.botUsers.push(botUser)
  }
}

// Mock TransactionRepository
class MockTransactionRepository implements TransactionRepository {
  private transactions: Transaction[] = []

  async add(transaction: Transaction): Promise<void> {
    this.transactions.push(transaction)
  }

  async getByPeriod(): Promise<Transaction[]> { return [] }
  async getById(): Promise<Transaction | null> { return null }
  async update(): Promise<void> {}
  async delete(): Promise<void> {}
  async search(): Promise<Transaction[]> { return [] }

  // Helper for tests
  getAll(): Transaction[] {
    return this.transactions
  }
}

describe('ProcessBotMessageUseCase', () => {
  let useCase: ProcessBotMessageUseCase
  let botUserRepository: MockBotUserRepository
  let transactionRepository: MockTransactionRepository
  let parseBotCommand: ParseBotCommandUseCase
  let addTransaction: AddTransactionUseCase

  beforeEach(() => {
    botUserRepository = new MockBotUserRepository()
    transactionRepository = new MockTransactionRepository()
    parseBotCommand = new ParseBotCommandUseCase()
    addTransaction = new AddTransactionUseCase(transactionRepository)
    useCase = new ProcessBotMessageUseCase(
      botUserRepository,
      parseBotCommand,
      addTransaction
    )

    // Add a test bot user
    botUserRepository.addBotUser({
      id: 'bot-1',
      userId: 'user-1',
      platform: 'telegram',
      platformUserId: '123456',
      platformUsername: '@testuser',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date()
    })
  })

  describe('Validation', () => {
    it('should return error response if message text is empty', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Message text is required')
      expect(response.text).toContain('Message text is required')
    })

    it('should return error response if bot user is not linked', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '999999', // Not linked
        text: '- makan 50k',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(false)
      expect(response.error).toContain('Bot account not linked')
      expect(response.text).toContain('Bot account not linked')
    })

    it('should return error response if bot user is inactive', async () => {
      // Add inactive bot user
      botUserRepository.addBotUser({
        id: 'bot-2',
        userId: 'user-2',
        platform: 'telegram',
        platformUserId: '777777',
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '777777',
        text: '- makan 50k',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(false)
      expect(response.error).toBe('Bot account is not active')
      expect(response.text).toContain('Bot account is not active')
    })
  })

  describe('Command Processing', () => {
    it('should process expense command and create transaction', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- makan 50k',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)
      expect(response.text).toContain('Expense added')
      expect(response.text).toContain('makan')
      expect(response.text).toContain('50.000') // Indonesian format
      expect(response.error).toBeUndefined()

      const transactions = transactionRepository.getAll()
      expect(transactions).toHaveLength(1)
      expect(transactions[0].type).toBe('expense')
      expect(transactions[0].amount).toBe(50000)
      expect(transactions[0].category).toBe('makan')
      expect(transactions[0].userId).toBe('user-1')
    })

    it('should process income command and create transaction', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '+ gaji 5jt',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)
      expect(response.text).toContain('Income added')
      expect(response.text).toContain('gaji')
      expect(response.text).toContain('5.000.000') // Indonesian format

      const transactions = transactionRepository.getAll()
      expect(transactions).toHaveLength(1)
      expect(transactions[0].type).toBe('income')
      expect(transactions[0].amount).toBe(5000000)
    })

    it('should handle command with note', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- makan makan siang 35k', // Note before amount
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)

      const transactions = transactionRepository.getAll()
      expect(transactions[0].category).toBe('makan')
      expect(transactions[0].amount).toBe(35000)
      // Note parsing is complex in ParseBotCommandUseCase, just verify transaction created
    })

    it('should handle decimal amounts', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- kopi 7.5k',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)

      const transactions = transactionRepository.getAll()
      expect(transactions[0].amount).toBe(7500)
    })

    it('should handle WhatsApp platform', async () => {
      // Add WhatsApp bot user
      botUserRepository.addBotUser({
        id: 'bot-wa',
        userId: 'user-2',
        platform: 'whatsapp',
        platformUserId: '+6281234567890',
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      })

      const message: BotMessage = {
        id: 'msg-1',
        platform: 'whatsapp',
        platformUserId: '+6281234567890',
        text: '- belanja 100k',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)

      const transactions = transactionRepository.getAll()
      expect(transactions[0].userId).toBe('user-2')
    })
  })

  describe('Error Handling', () => {
    it('should return error response for invalid command format', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: 'invalid command',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
      expect(response.text).toContain('Invalid command')

      const transactions = transactionRepository.getAll()
      expect(transactions).toHaveLength(0)
    })

    it('should return error for command without amount', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- makan',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(false)
      expect(response.error).toBeDefined()
    })

    it('should handle amount with minus prefix as expense (not negative)', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- makan 50k', // The '-' prefix means expense, not negative
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)
      const transactions = transactionRepository.getAll()
      expect(transactions[0].type).toBe('expense')
      expect(transactions[0].amount).toBe(50000)
    })
  })

  describe('Response Formatting', () => {
    it('should format large amounts with thousand separators', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '+ bonus 15jt',
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.text).toContain('15.000.000') // Indonesian format
    })

    it('should include category in response', async () => {
      const message: BotMessage = {
        id: 'msg-1',
        platform: 'telegram',
        platformUserId: '123456',
        text: '- kopi starbucks 15k', // Note before amount
        receivedAt: new Date()
      }

      const response = await useCase.execute({ message })

      expect(response.success).toBe(true)
      expect(response.text).toContain('kopi')
      expect(response.text).toContain('15.000')
    })
  })
})
