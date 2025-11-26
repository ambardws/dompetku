/**
 * BotMessage Entity
 * Represents a message received from a messaging bot
 */

import type { BotPlatform } from './BotUser'

export interface BotMessage {
  id: string
  platform: BotPlatform
  platformUserId: string
  text: string
  receivedAt: Date
}

export interface BotResponse {
  text: string
  success: boolean
  error?: string
}

export interface ProcessBotMessageInput {
  message: BotMessage
  userId?: string // Optional: pre-resolved user ID
}
