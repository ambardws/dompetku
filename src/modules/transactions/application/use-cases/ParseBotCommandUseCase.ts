/**
 * Parse Bot Command Use Case
 * Parses bot commands like "- makan 25k" into transaction data
 */
import type { TransactionType } from '../../domain/entities/Transaction'

export interface ParsedCommand {
  type: TransactionType
  category: string
  amount: number
  note?: string
}

export class ParseBotCommandUseCase {
  execute(command: string): ParsedCommand {
    const trimmed = command.trim()

    // Determine type based on prefix
    let type: TransactionType = 'expense'
    let content = trimmed

    if (trimmed.startsWith('+')) {
      type = 'income'
      content = trimmed.substring(1).trim()
    } else if (trimmed.startsWith('-')) {
      type = 'expense'
      content = trimmed.substring(1).trim()
    }

    // Find the amount pattern (number with optional decimal and k/jt/m suffix)
    const amountPattern = /(\d+(?:\.\d+)?(?:k|jt|m)?)\s*$/i
    const match = content.match(amountPattern)

    if (!match) {
      throw new Error('Invalid command format. Expected: [+/-] category amount [note]')
    }

    const amountStr = match[1]
    const beforeAmount = content.substring(0, match.index).trim()

    if (!beforeAmount) {
      throw new Error('Invalid command format. Expected: [+/-] category amount [note]')
    }

    // Split beforeAmount to get category and optional note
    const parts = beforeAmount.split(/\s+/)
    const category = parts.slice(0, -parts.length === 1 ? 1 : Math.max(1, Math.floor(parts.length / 2))).join(' ') || parts[0]
    const note = parts.length > 1 ? parts.slice(Math.floor(parts.length / 2)).join(' ') : undefined

    // Parse amount (supports formats like: 25k, 25000, 25.5k)
    const amount = this.parseAmount(amountStr)

    return {
      type,
      category: category.trim(),
      amount,
      note: note?.trim()
    }
  }

  private parseAmount(amountStr: string): number {
    const normalized = amountStr.toLowerCase().replace(/[,_]/g, '')

    // Handle 'k' suffix (thousands)
    if (normalized.endsWith('k')) {
      const num = parseFloat(normalized.slice(0, -1))
      if (isNaN(num)) {
        throw new Error('Invalid amount format')
      }
      return Math.round(num * 1000)
    }

    // Handle 'jt' or 'm' suffix (millions)
    if (normalized.endsWith('jt') || normalized.endsWith('m')) {
      const num = parseFloat(normalized.slice(0, -2))
      if (isNaN(num)) {
        throw new Error('Invalid amount format')
      }
      return Math.round(num * 1000000)
    }

    const num = parseFloat(normalized)
    if (isNaN(num)) {
      throw new Error('Invalid amount format')
    }

    return Math.round(num)
  }
}
