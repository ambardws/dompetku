/**
 * ProcessBotMessageUseCase
 * Business logic for processing bot messages and creating transactions
 */
import type { BotUserRepository } from '../../domain/repositories/BotUserRepository'
import type { ProcessBotMessageInput, BotResponse } from '../../domain/entities/BotMessage'
import type { ParseBotCommandUseCase } from '../../../transactions/application/use-cases/ParseBotCommandUseCase'
import type { AddTransactionUseCase } from '../../../transactions/application/use-cases/AddTransactionUseCase'

export class ProcessBotMessageUseCase {
  constructor(
    private botUserRepository: BotUserRepository,
    private parseBotCommand: ParseBotCommandUseCase,
    private addTransaction: AddTransactionUseCase
  ) {}

  async execute(input: ProcessBotMessageInput): Promise<BotResponse> {
    try {
      // Validation
      this.validate(input)

      // Find bot user
      const botUser = await this.botUserRepository.findByPlatformUser(
        input.message.platform,
        input.message.platformUserId
      )

      if (!botUser) {
        throw new Error('Bot account not linked. Please link your account first.')
      }

      if (!botUser.isActive) {
        throw new Error('Bot account is not active')
      }

      // Parse command
      const command = this.parseBotCommand.execute(input.message.text)

      // Create transaction
      await this.addTransaction.execute({
        userId: botUser.userId,
        type: command.type,
        amount: command.amount,
        category: command.category,
        note: command.note
      })

      // Format response
      const formattedAmount = this.formatAmount(command.amount)
      const typeText = command.type === 'income' ? 'Income' : 'Expense'
      let responseText = `✅ ${typeText} added: ${command.category} - Rp ${formattedAmount}`

      if (command.note) {
        responseText += `\nNote: ${command.note}`
      }

      return {
        text: responseText,
        success: true
      }
    } catch (error) {
      return {
        text: `❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  private validate(input: ProcessBotMessageInput): void {
    if (!input.message.text || input.message.text.trim() === '') {
      throw new Error('Message text is required')
    }
  }

  private formatAmount(amount: number): string {
    return amount.toLocaleString('id-ID')
  }
}
