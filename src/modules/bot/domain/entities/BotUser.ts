/**
 * BotUser Entity
 * Represents a user linked to a messaging bot (Telegram/WhatsApp)
 */

export interface BotUser {
  id: string
  userId: string // Dompetku user ID
  platform: BotPlatform
  platformUserId: string // Telegram user ID or WhatsApp phone number
  platformUsername?: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type BotPlatform = 'telegram' | 'whatsapp'

export interface CreateBotUserInput {
  userId: string
  platform: BotPlatform
  platformUserId: string
  platformUsername?: string
}

export interface BotUserLinkToken {
  token: string
  userId: string
  expiresAt: Date
  createdAt: Date
}
